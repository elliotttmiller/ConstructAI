"""Quick test to check get_division_summary return type"""

from constructai.document_processing.masterformat import MasterFormatClassifier

# Create test data
masterformat = MasterFormatClassifier()

# Test with sample classified sections
test_sections = [
    {
        "title": "Concrete Work",
        "content": "Concrete shall comply with ACI standards",
        "masterformat_classifications": [
            {
                "division": "03",
                "name": "Concrete",
                "confidence": 0.8,
                "method": "keyword"
            }
        ]
    },
    {
        "title": "Steel Work",
        "content": "Structural steel shall comply with ASTM standards",
        "masterformat_classifications": [
            {
                "division": "05",
                "name": "Metals",
                "confidence": 0.7,
                "method": "keyword"
            }
        ]
    }
]

result = masterformat.get_division_summary(test_sections)
print(f"Result type: {type(result)}")
print(f"Result value: {result}")
print(f"Result is dict: {isinstance(result, dict)}")
