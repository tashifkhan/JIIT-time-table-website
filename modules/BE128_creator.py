import re

def batch_extractor(text: str) -> str:
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[1:start_bracket].strip()
    return ""

def faculty_extractor(text: str) -> str:
    start_bracket = text.find('/')
    if start_bracket != -1:
        return text[start_bracket+1:].strip()
    return ""

def expand_batch(batch_code):
    """Expand batch code into list of individual batches."""
    if not batch_code:  # Handle empty or None
        return []
        
    if batch_code == 'ALL':
        return ['E', 'F']
    
    # Handle cases like E1E2E3E4E5
    single_batches = re.findall(r'[A-Z]\d', batch_code)
    if single_batches:
        return single_batches
        
    # Handle cases like F7F8
    matches = re.findall(r'([A-Z])(\d+)', batch_code)
    if matches:
        return [f"{letter}{number}" for letter, number in matches]
    
    return [batch_code]

def location_extractor(text: str) -> str:
    parts = text.split('-')
    if len(parts) < 2:
        return ""

    location = parts[-1].split('/')[0]
    return location.strip()

# Test cases
test_strings = [
    "PF7F8F9(18B11CS311)-CL3/AYUSHI/KEDARNATH/ANUBHUTI/PANKAJ MISHRA/NEERAJ JAIN",
    "LE15E16(15B11EC411) -\nCR53/BHARTENDU CHATURVEDI",
    "LF9F10(18B11EC213) -CR53/ATUL\nKUMAR",
    "LALL(21B12CS318) -148/ARTI JAIN",              # Should return ['E', 'F']
    "TE1E2E3E4E5(19B12HS613)- 244B/AMBA AGARWAL",   # Should return ['E1', 'E2', 'E3', 'E4', 'E5']
    "LE5(15B11EC611) -153/DIVYA KAUSHIK",           # Should return ['E5']
    "LF7F8(15B11CI513) -148/ASHISH"                 # Should return ['F7', 'F8']
]

for test in test_strings:
    batch = batch_extractor(test)
    expanded = expand_batch(batch)
    print(f"Input: {test}")
    print(f"Extracted: {batch}")
    print(f"location: {location_extractor(test)}")
    print(f"faculty: {faculty_extractor(test)}")
    print(f"Expanded: {expanded}\n")