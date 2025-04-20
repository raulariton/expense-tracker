class ReceiptResponse:
    def __init__(self, total, vendor=None, date=None):
        self.total = total
        self.vendor = vendor
        self.date = date
