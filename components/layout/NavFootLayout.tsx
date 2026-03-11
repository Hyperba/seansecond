import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

export default function NavFootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    )
}