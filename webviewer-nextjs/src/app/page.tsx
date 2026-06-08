import WebViewer from '@/components/WebViewer';

export default function Home() {
  return (
    <main className='flex flex-col h-full'>
      <div className="flex flex-row p-4 bg-apryse-blue justify-between w-full align-middle">
        <h1 className="text-xl font-bold align-middle">
          Apryse WebViewer - Next.js Sample
        </h1>
        <a href='https://docs.apryse.com/documentation/web/guides/'>
          <button className="bg-white text-black rounded p-1">Guides</button>
        </a>
      </div>
      
      <div className='flex-1 overflow-hidden'>
        <WebViewer/>
      </div>
    </main>
  );
}
