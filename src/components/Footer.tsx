import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { data } from "@/data/company.js";
import WhatsAppIcon from "./WhatsAppIcon";

const company = data;

const Footer = () => {
  return (
    <footer className="bg-white mt-auto text-muted-foreground text-sm text-footer-foreground">
      <div className="container  px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-light tracking-tight text-gray-800">{company.name}</h3>
            <p>
              {company.slogan}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className=" hover:text-foreground transition-smooth"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className=" hover:text-foreground transition-smooth"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className=" hover:text-foreground transition-smooth"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Contato</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 ">
                <MapPin className="h-4 w-4" />
                <span>{company.address}</span>
              </li>
              <li className="flex items-center gap-2 ">
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </li>
              <li className="flex items-center gap-2 ">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Redes Sociais</h4>
            <div className="flex gap-4  hover:text-foreground transition-smooth">
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={company.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={data.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 p-8  border-t bg-primary-gradient opacity-40 border-border text-black text-center text-sm ">
        <p>&copy; {new Date().getFullYear()} {company.name}. Todos os direitos reservados.</p>
        <a href="https://techculture.com.br">Desenvolvido por Tech Culture Brasil</a>
      </div>
    </footer>
  );
};

export default Footer;
