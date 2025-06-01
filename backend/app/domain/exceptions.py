class FileValidationError(Exception):
    """Raised when a file validation fails"""
    pass

class FileNotFoundError(Exception):
    """Raised when a file is not found"""
    pass

class FileOperationError(Exception):
    """Raised when a file operation fails"""
    pass 