export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
