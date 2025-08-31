export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()


export default function layout({ children, params }) {
  return <>{children}</>;
}
