import asyncio
import os
import httpx
import logging
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv(".env")

async def test_openai_connection():
    """Test connection to OpenAI API using the API key from environment variables."""
    
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("No OpenAI API key found in environment variables")
        return
    
    logger.info(f"Using OpenAI API key: {api_key[:4]}...{api_key[-4:]}")
    
    headers = {"Authorization": f"Bearer {api_key}"}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            logger.info("Testing connection to OpenAI API...")
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Hello, are you working?"}
                    ],
                    "max_tokens": 50
                }
            )
            
            logger.info(f"Response status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                logger.info(f"API response content: {content}")
                logger.info("penAI API connection successful!")
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.exception(f"Error testing OpenAI connection: {e}")

if __name__ == "__main__":
    asyncio.run(test_openai_connection())