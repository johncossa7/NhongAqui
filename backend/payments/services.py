class PaymentProviderUnavailable(Exception):
    pass


class PaymentService:
    def create_checkout(self, *args, **kwargs):
        raise PaymentProviderUnavailable("Pagamentos reais nao estao ativos nesta versao.")
