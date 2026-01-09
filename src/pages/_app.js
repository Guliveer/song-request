import { UserProvider } from "@/context/UserContext";
import "@/styles/globals.css";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import PropTypes from "prop-types";
import React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col max-w-full">
        <NavMenu />
        <Component {...pageProps} />
        <Footer />
      </div>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </UserProvider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
