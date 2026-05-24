import { Container } from "@/components/common/container";
import { EmptyPaymentFailed } from "@/components/empty-states/empty-payment-failed";

export default function CheckoutFailedPage() {
  return (
    <Container size="narrow">
      <EmptyPaymentFailed />
    </Container>
  );
}
