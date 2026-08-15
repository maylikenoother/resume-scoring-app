from fpdf import FPDF
import markdown2
import json

def generate_api_documentation_pdf(openapi_spec: dict) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "CV Review API Documentation", ln=True)
    
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, f"Version: {openapi_spec.get('info', {}).get('version', 'Unknown')}", ln=True)
    pdf.cell(0, 10, f"Title: {openapi_spec.get('info', {}).get('title', 'API Documentation')}", ln=True)
    
    pdf.set_font("Arial", "", 10)
    description = openapi_spec.get('info', {}).get('description', '')
    if description:
        pdf.multi_cell(0, 10, description)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Endpoints", ln=True)
    
    pdf.set_font("Arial", "", 10)
    paths = openapi_spec.get('paths', {})
    for path, path_info in paths.items():
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, path, ln=True)
        
        pdf.set_font("Arial", "", 10)
        for method, method_info in path_info.items():
            pdf.cell(0, 7, f"  Method: {method.upper()}", ln=True)
            summary = method_info.get('summary', 'No summary')
            description = method_info.get('description', 'No description')
            pdf.cell(0, 7, f"  Summary: {summary}", ln=True)
            pdf.multi_cell(0, 7, f"  Description: {description}")
    
    return pdf.output(dest='S').encode('latin1')

def markdown_to_pdf(markdown_content: str) -> bytes:
    html_content = markdown2.markdown(markdown_content)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "", 12)
    
    pdf.write_html(html_content)
    
    return pdf.output(dest='S').encode('latin1')
