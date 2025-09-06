def test_basic_math() -> None:
    """Test basic math operations"""
    assert 2 + 2 == 4
    assert 3 * 4 == 12
    assert 10 / 2 == 5

def test_strings() -> None:
    """Test string operations"""
    assert "hello" + " world" == "hello world"
    assert len("test") == 4

def test_lists() -> None:
    """Test list operations"""
    test_list = [1, 2, 3]
    assert len(test_list) == 3
    assert test_list[0] == 1
    test_list.append(4)
    assert len(test_list) == 4

def test_dictionaries() -> None:
    """Test dictionary operations"""
    test_dict = {"key": "value", "number": 42}
    assert test_dict["key"] == "value"
    assert test_dict["number"] == 42
    test_dict["new"] = "item"
    assert len(test_dict) == 3

if __name__ == "__main__":
    test_basic_math()
    test_strings()
    test_lists()
    test_dictionaries()
    print("🎉 All minimal tests passed!")

