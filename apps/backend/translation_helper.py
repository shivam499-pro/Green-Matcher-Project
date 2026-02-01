
"""
Add this to your backend to handle translations
"""

from googletrans import Translator

translator = Translator()

def translate_resume_for_display(resume_data: dict, target_language: str) -> dict:
    """
    Translate resume content to target language for display
    Keep original for search indexing
    """
    if target_language == 'en':
        return resume_data
    
    try:
        # Translate summary
        if resume_data.get('summary'):
            resume_data['summary_translated'] = translator.translate(
                resume_data['summary'], 
                dest=target_language
            ).text
        
        # Translate skills
        if resume_data.get('skills'):
            resume_data['skills_translated'] = [
                translator.translate(skill, dest=target_language).text
                for skill in resume_data['skills']
            ]
        
        # Translate experience
        if resume_data.get('experience'):
            for exp in resume_data['experience']:
                exp['title_translated'] = translator.translate(
                    exp['title'], 
                    dest=target_language
                ).text
                exp['achievements_translated'] = [
                    translator.translate(ach, dest=target_language).text
                    for ach in exp['achievements']
                ]
        
        return resume_data
        
    except Exception as e:
        print(f"Translation error: {e}")
        return resume_data  # Return original if translation fails
