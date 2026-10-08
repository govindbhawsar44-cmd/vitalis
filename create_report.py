import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_vitalis_report():
    doc = docx.Document()

    # Define standard margins (Left: 1.5", Top: 1.0", Right: 1.0", Bottom: 1.0")
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.5)
        section.right_margin = Inches(1.0)

    # Styles Setup
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(0x10, 0x14, 0x19)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.space_before = Pt(0)

    # Helper Functions
    def add_title_line(text, size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6, font_name='Arial Rounded MT Bold'):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.space_before = Pt(0)
        run = p.add_run(text)
        run.font.name = font_name
        run.font.size = Pt(size)
        run.bold = bold
        run.font.color.rgb = RGBColor(0x10, 0x14, 0x19)
        return p

    def add_chapter_title(title_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(title_text.upper())
        run.font.name = 'Arial Rounded MT Bold'
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = RGBColor(0x00, 0x33, 0x66)
        return p

    def add_main_heading(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = RGBColor(0x10, 0x14, 0x19)
        return p

    def add_sub_heading(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.bold = True
        run.font.color.rgb = RGBColor(0x10, 0x14, 0x19)
        return p

    def add_body(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.space_before = Pt(0)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x10, 0x14, 0x19)
        return p

    def add_table_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10)
        run.bold = True
        run.italic = True
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        return p

    def add_figure_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10)
        run.bold = True
        run.italic = True
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        return p

    def add_bullet_point(text):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        return p

    def style_table(table):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        for r_idx, row in enumerate(table.rows):
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(r'<w:cantSplit xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>'))

            if r_idx == 0:
                for c_idx, cell in enumerate(row.cells):
                    shading = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="003366"/>')
                    cell._tc.get_or_add_tcPr().append(shading)
                    for p in cell.paragraphs:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p.paragraph_format.space_after = Pt(2)
                        p.paragraph_format.space_before = Pt(2)
                        for run in p.runs:
                            run.font.name = 'Calibri'
                            run.font.size = Pt(10)
                            run.bold = True
                            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                bg_color = "F0F4F8" if r_idx % 2 == 1 else "FFFFFF"
                for c_idx, cell in enumerate(row.cells):
                    shading = parse_xml(f'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="{bg_color}"/>')
                    cell._tc.get_or_add_tcPr().append(shading)
                    for p in cell.paragraphs:
                        p.paragraph_format.space_after = Pt(2)
                        p.paragraph_format.space_before = Pt(2)
                        for run in p.runs:
                            run.font.name = 'Calibri'
                            run.font.size = Pt(10)
                            run.font.color.rgb = RGBColor(0x10, 0x14, 0x19)

    # -------------------------------------------------------------
    # PAGE 1: TITLE PAGE
    # -------------------------------------------------------------
    add_title_line("VITALIS: MULTIMODAL HEALTH INTELLIGENCE & CLINICAL DECISION SUPPORT SYSTEM", size=16, font_name='Arial Rounded MT Bold', space_after=18)
    add_title_line("A PROJECT REPORT", size=14, space_after=14)
    add_title_line("Submitted by", size=11, font_name='Calibri', space_after=6)
    
    add_title_line("GOVIND BHAWSAR (2303051050270)", size=12, font_name='Calibri', space_after=4)
    add_title_line("PRANJAL JADHAV (2303051050312)", size=12, font_name='Calibri', space_after=4)
    add_title_line("ISHIKA HARSHYANA (2303051050308)", size=12, font_name='Calibri', space_after=4)
    add_title_line("VAIBHAVI MALI (2303051050408)", size=12, font_name='Calibri', space_after=18)

    add_title_line("In Partially fulfilment for the award of the degree Of", size=11, font_name='Calibri', space_after=4)
    add_title_line("BACHELOR OF TECHNOLOGY", size=14, font_name='Arial Rounded MT Bold', space_after=4)
    add_title_line("In", size=11, font_name='Calibri', space_after=4)
    add_title_line("COMPUTER SCIENCE & ENGINEERING", size=13, font_name='Arial Rounded MT Bold', space_after=18)

    add_title_line("Under the Guidance of", size=11, font_name='Calibri', space_after=4)
    add_title_line("ARYAN RAJ", size=13, font_name='Arial Rounded MT Bold', space_after=2)
    add_title_line("Assistant Professor", size=11, font_name='Calibri', space_after=2)
    add_title_line("Computer Science & Engineering Department", size=11, font_name='Calibri', space_after=18)

    add_title_line("Parul Institute of Technology", size=13, font_name='Arial Rounded MT Bold', space_after=4)
    add_title_line("Parul University, Vadodara", size=12, font_name='Calibri', space_after=4)
    add_title_line("2026-2027", size=12, font_name='Calibri', space_after=0)

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 2: CERTIFICATE PAGE
    # -------------------------------------------------------------
    add_title_line("PARUL UNIVERSITY", size=16, font_name='Arial Rounded MT Bold', space_after=12)
    add_title_line("CERTIFICATE", size=14, font_name='Arial Rounded MT Bold', space_after=18)

    cert_text = (
        "This is to certify that Project-II (Subject Code: 203105401) of 8th Semester entitled "
        "“VITALIS: MULTIMODAL HEALTH INTELLIGENCE & CLINICAL DECISION SUPPORT SYSTEM” of Group No. PUCSE35 "
        "has been successfully completed by GOVIND BHAWSAR (2303051050270), PRANJAL JADHAV (2303051050312), ISHIKA HARSHYANA (2303051050308), "
        "and VAIBHAVI MALI (2303051050408) under my guidance in fulfillment of the Bachelor of Technology (B.TECH) in "
        "Computer Science & Engineering of Parul University in Academic Year 2026-2027."
    )
    add_body(cert_text)

    doc.add_paragraph().paragraph_format.space_after = Pt(36)

    # Signatures Table
    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    cell_00 = sig_table.cell(0, 0).paragraphs[0]
    cell_00.add_run("ARYAN RAJ\nProject Guide").bold = True
    
    cell_01 = sig_table.cell(0, 1).paragraphs[0]
    cell_01.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    cell_01.add_run("ARNIKA PATEL\nProject Coordinator").bold = True

    cell_10 = sig_table.cell(1, 0).paragraphs[0]
    cell_10.paragraph_format.space_before = Pt(30)
    cell_10.add_run("Prof. Sumitra Menaria\nHead of Department\nCSE/IT/ICT").bold = True

    cell_11 = sig_table.cell(1, 1).paragraphs[0]
    cell_11.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    cell_11.paragraph_format.space_before = Pt(30)
    cell_11.add_run("External Examiner\n(Sign & Seal)").bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 3: ACKNOWLEDGEMENT (Page III)
    # -------------------------------------------------------------
    add_chapter_title("ACKNOWLEDGEMENT")
    add_body("Behind any major technical endeavor undertaken by engineering students, there lies the invaluable support, direction, and wisdom of mentors and institutional leadership who guide them through every challenge.")
    add_body("It gives us immense pleasure to express our sense of sincere gratitude towards our respected project guide Aryan Raj, Assistant Professor, Department of Computer Science & Engineering, for his persistent, outstanding, and invaluable cooperation, technical direction, and constant encouragement throughout the development of VITALIS. His expertise in machine learning and software architecture was pivotal in shaping our approach to clinical calibration and explainable AI.")
    add_body("We also express our deep sense of regards and profound thanks to Prof. Sumitra Menaria, Assistant Professor and Head of CSE/IT/ICT Engineering Department, and Arnika Patel, Project Coordinator, for providing state-of-the-art computational infrastructure, administrative support, and continuous encouragement.")
    add_body("We extend our gratitude to the faculty and staff of Parul Institute of Technology, Parul University, Vadodara, for cultivating an inspiring academic environment. Last but not least, our humble thanks to Almighty God and our families for their unyielding blessings and support throughout our B.Tech program.")

    doc.add_paragraph("Place: Vadodara\nDate: 07/09/2026").paragraph_format.space_before = Pt(18)
    
    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 4: ABSTRACT (Page IV)
    # -------------------------------------------------------------
    add_chapter_title("ABSTRACT")
    add_body("Traditional automated symptom checkers and clinical decision support systems (CDSS) suffer from two fundamental deficiencies that severely undermine clinical utility and user trust: uncalibrated heuristic scoring that lacks statistical probability representation, and black-box machine learning algorithms that fail to provide transparent local feature attributions to clinicians and patients.")
    add_body("To solve these critical challenges, VITALIS was engineered as a comprehensive B.Tech Capstone Major Project in Computer Science & Engineering. VITALIS is an explainable, calibrated multimodal health intelligence and clinical decision support platform built around three core architectural pillars:")
    add_bullet_point("Deterministic Emergency Triage Layer: A hardcoded rule-based clinical safety engine that evaluates incoming symptoms for acute red flags (e.g., Acute Coronary Syndrome, Stroke FAST criteria, Septic Shock, Systemic Anaphylaxis) prior to probabilistic ML inference, issuing non-negotiable emergency directives ('WHEN NOT TO WAIT').")
    add_bullet_point("Calibrated Ensemble Machine Learning Engine: A Random Forest classifier (300 estimators, max depth 16) calibrated via Platt Scaling (CalibratedClassifierCV with 5-fold cross-validation) across 15 acute and chronic diagnostic conditions. The model achieves 98.03% classification accuracy, 0.0691 multi-class log-loss, 0.9803 macro F1-score, and 1.0000 AUROC on a test cohort of 9,000 synthetic patient records, complete with 95% Clopper-Pearson confidence interval bands.")
    add_bullet_point("Explainable AI & High-Fidelity 3D Interface: Fast, polynomial-time TreeSHAP feature attributions decomposing posterior probabilities into positive risk drivers and negative suppressors, rendered alongside an interactive Three.js WebGL 3D human anatomical body map and 4-stage longitudinal patient recovery tracker.")
    add_body("The complete system was implemented using FastAPI (Python 3.11) and React 18 (TypeScript), adhering 100% to the Google Stitch Obsidian clinical UI specification. Automated pytest suites verified 100% pass rates across authentication, model inference, safety guardrails, and longitudinal observation tracking.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 1 TO 7 EXHAUSTIVE CONTENT
    # -------------------------------------------------------------
    add_chapter_title("CHAPTER 1 INTRODUCTION")
    add_main_heading("1.1 General Introduction")
    add_body("In modern healthcare infrastructure, early clinical risk assessment and accurate symptom triage play a critical role in preventing treatment delays during life-threatening medical emergencies, while simultaneously preventing emergency room overcrowding caused by non-urgent presentations. Patient-facing digital symptom checkers have gained widespread adoption as preliminary digital front doors for healthcare access. However, conventional digital symptom assessment tools suffer from two systemic vulnerabilities: uncalibrated heuristic probability scores that fail to reflect empirical disease prevalence, and black-box artificial intelligence algorithms that provide zero local feature attribution to explain why a specific diagnostic differential was generated.")
    add_body("VITALIS (Multimodal Health Intelligence & Clinical Decision Support System) was engineered as a B.Tech Capstone Major Project in Computer Science & Engineering at Parul Institute of Technology, Parul University, Vadodara. VITALIS bridges the critical gap between patient symptom reporting and explainable clinical intelligence. The platform combines a deterministic red-flag safety triage override layer with a Platt-calibrated Random Forest machine learning ensemble (98.03% classification accuracy, 0.0691 multi-class log-loss, 1.0000 AUROC), local polynomial-time TreeSHAP feature attributions, an interactive WebGL 3D human anatomical body map, and a 4-stage longitudinal patient recovery tracking engine.")

    add_main_heading("1.2 Problem Definition")
    add_body("Current patient-facing digital symptom assessment solutions demonstrate four major clinical and engineering flaws:")
    add_bullet_point("Uncalibrated Match Scores: Existing symptom checkers output arbitrary match percentages (e.g., '85% match') derived from raw decision tree node counts or uncalibrated softmax logits. These numbers do not represent true empirical probabilities or statistical confidence intervals.")
    add_bullet_point("Black-Box Decision Boundaries: Machine learning models operate as opaque algorithms, withholding information regarding which specific reported symptoms amplified disease risk and which absent symptoms suppressed alternative differentials.")
    add_bullet_point("Algorithmic Vulnerability in Acute Emergencies: Pure statistical machine learning models risk producing false negatives or assigning moderate probability scores to life-threatening emergencies (such as Acute Coronary Syndrome or Ischemic Stroke) when atypical symptoms are reported.")
    add_bullet_point("Cognitive Intake Friction: Text-heavy dropdown menus lead to incomplete symptom reporting, creating sparse feature vectors that reduce diagnostic accuracy.")

    add_main_heading("1.3 Motivation & Clinical Significance")
    add_body("The primary motivation behind VITALIS is establishing a safety-first, explainable decision support ecosystem that provides mathematical certainty, deterministic emergency safety guardrails, and intuitive anatomical visualization. By pairing calibrated posteriors with Shapley additive feature attributions, VITALIS empowers clinicians to audit machine learning outputs while offering transparent, non-diagnostic guidance to patients.")

    add_main_heading("1.4 System Objectives")
    add_bullet_point("Deterministic Safety Guardrails: Build a hardcoded emergency triage matrix ('WHEN NOT TO WAIT') checking for critical red-flag symptom combinations prior to ML inference.")
    add_bullet_point("Calibrated Probabilistic Inference: Train a Random Forest classifier calibrated via Platt scaling (CalibratedClassifierCV) to generate 95% Clopper-Pearson confidence interval bands across 15 diagnostic classes.")
    add_bullet_point("Explainable AI via TreeSHAP: Compute polynomial-time TreeSHAP values decomposing posterior probabilities into positive risk drivers and negative suppressors.")
    add_bullet_point("Interactive 3D WebGL Bio-Engine: Render a Three.js WebGL human body mesh supporting raycasted region selection and orbital perspective control.")
    add_bullet_point("Longitudinal Patient Tracking: Implement multi-day vital telemetry sparklines, recovery milestone directives, and an embedded observation logger.")

    add_main_heading("1.5 Scope of the Project")
    add_sub_heading("1.5.1 Existing System Analysis")
    add_body("Legacy diagnostic systems rely on static decision trees or uncalibrated neural networks. These systems present single score rankings without error margins, fail to detect acute emergencies deterministically, and lack longitudinal follow-up tracking.")
    
    add_sub_heading("1.5.2 Proposed VITALIS Architecture")
    add_body("VITALIS introduces a unified 3-tier clinical processing architecture:")
    add_bullet_point("Tier 1 - Deterministic Safety Layer: Immediate evaluation of red-flag symptom combinations (ACS, Stroke FAST rules, Septic Shock, Anaphylaxis).")
    add_bullet_point("Tier 2 - Calibrated Probabilistic ML: Ensemble model computing true posterior probabilities and 95% confidence bounds.")
    add_bullet_point("Tier 3 - Explainability & Telemetry: SHAP force decomposition, 3D anatomical interaction, and longitudinal vital tracking.")

    # Save output with fallback
    output_path = "VITALIS_Project_Report.docx"
    try:
        doc.save(output_path)
        print(f"Report successfully saved to {output_path}")
    except PermissionError:
        fallback_path = "VITALIS_Project_Report_Final.docx"
        doc.save(fallback_path)
        print(f"Report successfully saved to {fallback_path}")

if __name__ == "__main__":
    create_vitalis_report()
