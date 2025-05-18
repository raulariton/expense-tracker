from starlette.responses import JSONResponse
from models.exceptions import (
    SegmentationModelError,
    EdgeDetectionError,
    PerspectiveTransformationError,
    OCRProcessingError,
)

def set_exception_handlers(app):
    @app.exception_handler(SegmentationModelError)
    async def segmentation_model_exception_handler(request, exc: SegmentationModelError):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error",
                "details": exc.message,
            },
        )


    @app.exception_handler(EdgeDetectionError)
    async def edge_detection_exception_handler(request, exc: EdgeDetectionError):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Bad image; unable to detect any contours",
                "details": exc.message,
            },
        )


    @app.exception_handler(PerspectiveTransformationError)
    async def perspective_transformation_exception_handler(
        request, exc: PerspectiveTransformationError
    ):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Bad image; unable to perform perspective transformation",
                "details": exc.message,
            },
        )


    @app.exception_handler(OCRProcessingError)
    async def ocr_processing_exception_handler(request, exc: OCRProcessingError):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Bad image; did not find necessary text",
                "details": exc.message,
            },
        )