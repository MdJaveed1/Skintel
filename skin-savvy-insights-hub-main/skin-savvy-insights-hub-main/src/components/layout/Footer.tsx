import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram, Twitter, Facebook, Shield, Star, BookOpen } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-primary-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.3 14.8C19.3 19 14.8 22 12 22C9.2 22 4.7 19 4.7 14.8C4.7 12.7 5.8 10.8 7.5 9.6L6 2L12 5L18 2L16.5 9.6C18.2 10.8 19.3 12.7 19.3 14.8Z" />
                <path d="M12 22V18" />
                <path d="M14 18h-4" />
                <circle cx="12" cy="13" r="2" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-primary-500 dark:text-primary-400">SkinTel</span>
            </Link>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-sm">
              Your personal AI-powered skincare assistant for personalized recommendations and skin analysis.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Features</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/skin-analysis" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Skin Analysis
                </Link>
              </li>
              <li>
                <Link to="/color-analysis" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Color Analysis
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Skincare Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/blog" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Skincare Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Skin Type Guide
                </Link>
              </li>
              <li>
                <Link to="/ingredients" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Ingredient Dictionary
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} SmartSkinCare. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400 flex items-center text-sm">
              <Shield className="h-4 w-4 mr-1" /> 
              <span>Privacy</span>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400 flex items-center text-sm">
              <Star className="h-4 w-4 mr-1" /> 
              <span>Reviews</span>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400 flex items-center text-sm">
              <BookOpen className="h-4 w-4 mr-1" /> 
              <span>Blog</span>
            </a>
            <a href="mailto:contact@smartskincare.com" className="text-neutral-500 hover:text-primary-400 dark:text-neutral-400 dark:hover:text-primary-400 flex items-center text-sm">
              <Mail className="h-4 w-4 mr-1" /> 
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;