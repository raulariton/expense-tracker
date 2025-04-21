class SegmentationModelError(Exception):
    """
    An exception signalling an error with the segmentation model.
    """
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"SegmentationModelError: {self.message}"

class EdgeDetectionError(Exception):
    """
    An exception signalling an error with the edge detection process.
    """
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"EdgeDetectionError: {self.message}"

class PerspectiveTransformationError(Exception):
    """
    An exception signalling an error with the perspective transformation process.
    """
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"PerspectiveTransformationError: {self.message}"

class OCRProcessingError(Exception):
    """
    An exception signalling an error with the OCR processing.
    """
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def __str__(self):
        return f"OCRProcessingError: {self.message}"