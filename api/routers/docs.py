from fastapi import APIRouter, Response
from fastapi.responses import HTMLResponse
import httpx
from .pdf_generator import generate_api_documentation_pdf

router = APIRouter(
    prefix="/docs",
    tags=["documentation"],
)

REDOC_HTML = """
<!DOCTYPE html>
<html>
  <head>
    <title>CV Review API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='/openapi.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
  </body>
</html>
"""

@router.get("", response_class=HTMLResponse)
async def get_documentation():
    """
    Serve ReDoc documentation page
    """
    return HTMLResponse(content=REDOC_HTML, status_code=200)

@router.get("/pdf")
async def get_documentation_pdf():
    """
    Generate PDF of API documentation
    """
    try:
        async with httpx.AsyncClient() as client:
            # Fetch OpenAPI JSON
            response = await client.get('http://localhost:8000/openapi.json')
            openapi_spec = response.json()
        
        # Generate PDF
        pdf_content = generate_api_documentation_pdf(openapi_spec)
        
        return Response(
            content=pdf_content, 
            media_type="application/pdf",
            headers={"Content-Disposition": "inline; filename=cv_review_api_docs.pdf"}
        )
    except Exception as e:
        return Response(
            content=f"Error generating PDF: {str(e)}", 
            status_code=500
        )