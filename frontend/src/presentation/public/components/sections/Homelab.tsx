import { Section } from '@/presentation/shared/ui/Section';
import { Container } from '@/presentation/shared/ui/Container';
import { Grid } from '@/presentation/shared/ui/Grid';
import { ImagePlaceholder } from '@/presentation/shared/ui/ImagePlaceholder';

export default function Homelab() {
  return (
    <Section id="homelab" style={{ padding: 'var(--section-padding, 60px 0)' }}>
      <Container style={{ maxWidth: 'var(--container-max-width, 1200px)', padding: 'var(--container-padding, 0 24px)' }}>
        <h2 className="section-heading">Homelab</h2>
        <p className="section-paragraph">
          Hier findest du bald Fotos, Hardware-Setups, Netzwerkdiagramme und Automatisierungen aus meinem Homelab!
        </p>
        <Grid columns={2} gap="var(--homelab-grid-gap, 2rem)">
          <ImagePlaceholder text="Platzhalter für Fotos" />
          <ImagePlaceholder text="Platzhalter für Hardware-Setup" />
          <ImagePlaceholder text="Platzhalter für Netzwerkdiagramm" />
          <ImagePlaceholder text="Platzhalter für Automatisierungen" />
        </Grid>
      </Container>
    </Section>
  );
} 