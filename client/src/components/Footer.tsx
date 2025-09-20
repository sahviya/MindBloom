import { Link } from "wouter";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Community", href: "/community" },
  { label: "Media", href: "/media" },
  { label: "Snap", href: "/snap" },
  { label: "Genie", href: "/genie" },
  { label: "Books", href: "/books" },
  { label: "Games", href: "/games" },
  { label: "Shopping", href: "/shopping" },
  { label: "Profile", href: "/profile" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: "fab fa-instagram" },
  { label: "YouTube", href: "https://youtube.com", icon: "fab fa-youtube" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "fab fa-linkedin" },
  { label: "Twitter", href: "https://twitter.com", icon: "fab fa-x-twitter" },
];


export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, hsl(263, 70%, 60%) 0%, hsl(217, 91%, 60%) 50%, hsl(45, 100%, 60%) 100%)"
      }}
      className="text-gray-100 pt-6 pb-2 px-2 font-[Montserrat]"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Branding */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-serif tracking-wide mb-0.5 text-white drop-shadow-lg">
            🌸 Mind Bloom
          </span>
          <span className="text-[11px] text-gray-200 mb-1 tracking-wide">
            © 2025 Mind Bloom. All Rights Reserved.
          </span>
        </div>

        {/* Main Sections */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          {/* Navigation & Legal */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2">
            {/* Quick Navigation */}
            <nav className="flex flex-wrap justify-center gap-2 mb-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-100 hover:text-white hover:underline underline-offset-4 transition font-medium text-sm px-1 py-0.5 rounded"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Legal & Policies */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[11px] text-gray-200">
              {legalLinks.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:underline hover:text-white transition"
                >
                  {link.label}
                  {i < legalLinks.length - 1 && <span className="mx-1">|</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info & Social */}
          <div className="flex-1 flex flex-col items-center md:items-end gap-1">
            <div className="text-xs flex items-center gap-1">
              <span role="img" aria-label="email" className="text-base">📧</span>
              <a href="mailto:support@mindbloom.com" className="hover:underline text-gray-100">
                support@mindbloom.com
              </a>
            </div>
            <div className="text-xs flex items-center gap-1">
              <span role="img" aria-label="address" className="text-base">📍</span>
              <span>Karnataka, India</span>
            </div>
            {/* Social Media */}
            <div className="flex gap-3 mt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-lg text-gray-200 hover:text-white transition-colors"
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Crisis & Helpline Numbers */}
        <div className="w-full flex justify-center">
          <div className="bg-[#e63946] text-white rounded-xl px-4 py-3 shadow-lg max-w-2xl w-full flex flex-col items-center gap-1 border-2 border-[#fff2]">
            <div className="font-bold text-base mb-0.5 tracking-wide drop-shadow">
              🚨 Crisis Help – You Are Not Alone
            </div>
            <div className="flex flex-col gap-0.5 w-full text-xs">
              <a href="tel:18005990019" className="hover:underline font-medium">
                ☎ India Suicide Prevention Helpline: <span className="font-bold">1800-599-0019</span> (24/7)
              </a>
              <a href="tel:+18002738255" className="hover:underline font-medium">
                ☎ International Suicide Lifeline: <span className="font-bold">+1-800-273-8255</span> (24/7, USA)
              </a>
              <a href="tel:181" className="hover:underline font-medium">
                ☎ Women’s Helpline (Harassment/Domestic Violence – India): <span className="font-bold">181</span>
              </a>
              <a href="tel:100" className="hover:underline font-medium">
                ☎ Police Emergency (India): <span className="font-bold">100</span>
              </a>
              <a href="tel:1098" className="hover:underline font-medium">
                ☎ Child Helpline (India): <span className="font-bold">1098</span>
              </a>
            </div>
            <div className="text-[11px] text-white/90 mt-1 text-center font-medium">
              If you are struggling, please reach out. Help is just one call away.
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-[11px] text-gray-200 mt-3 tracking-wide">
          Built with <span className="text-white">❤️</span> by Team TechBloom 🚀
        </div>
      </div>
    </footer>
  );
}