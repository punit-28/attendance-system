import { Public_Sans } from "next/font/google";
import Nav from "../components/Nav";
import "./globals.css";

const font = Public_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Roll Call — Attendance System",
  description: "Mark daily attendance, track percentages and export reports.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Nav />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
