import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Research Commons Africa',description:'Peer to Peer Research Collaboration across borders, disciplines and practice'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
