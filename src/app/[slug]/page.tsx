import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Manicure1Template from '@/app/templates/manicure1/page';
import Manicure2Template from '@/app/templates/manicure2/page';
import Barbearia1Template from '@/app/templates/barbearia1/page';

export const dynamic = 'force-dynamic';

interface PublicPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicTenantPage({ params }: PublicPageProps) {
  const { slug } = params;

  console.log(`DEBUG_PUBLIC: Buscando tenant para slug: "${slug}"`);
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) {
    console.error(`DEBUG_PUBLIC: Tenant não encontrado para slug: "${slug}"`);
    notFound();
  }

  console.log(`DEBUG_PUBLIC: Tenant encontrado: ${tenant.nome} | Template no Banco: ${(tenant as any).template}`);

  // Map template slugs to components
  // In a real scenario, these page components might need data from the tenant
  // For now, we render the page component directly as they are currently "single page" apps
  const t = tenant as any;
  
  // Buscar serviços e profissionais reais
  const services = await prisma.servico.findMany({ where: { ativo: true } });
  const professionals = await prisma.profissional.findMany({ where: { ativo: true } });

  switch (t.template) {
    case 'manicure2':
      return <Manicure2Template tenant={tenant} services={services} professionals={professionals} />;
    case 'barbearia1':
      return <Barbearia1Template tenant={tenant} services={services} professionals={professionals} />;
    case 'manicure1':
    default:
      return <Manicure1Template tenant={tenant} services={services} professionals={professionals} />;
  }
}
