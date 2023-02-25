import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { createTheme, responsiveFontSizes, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { NextComponentType } from "next";

let theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#DA127D",
      "50": "#FFE3EC",
      "100": "#FFB8D2",
      "200": "#FF8CBA",
      "300": "#F364A2",
      "400": "#E8368F",
      "500": "#DA127D",
      "600": "#BC0A6F",
      "700": "#A30664",
      "800": "#870557",
      "900": "#620042",
    },
    grey: {
      "50": "#F6F6F9",
      "100": "#EDEDF3",
      "200": "#DBDBE6",
      "300": "#B6BBC8",
      "400": "#8691A2",
      "500": "#616E7C",
      "600": "#4D5860",
      "700": "#3C4348",
      "800": "#282C2F",
      "900": "#1C1F21",
    },
    error: {
      "900": "#610404",
      "800": "#780A0A",
      "700": "#911111",
      "600": "#A61B1B",
      "500": "#BA2525",
      "400": "#D64545",
      "300": "#E66A6A",
      "200": "#F29B9B",
      "100": "#FACDCD",
      "50": "#FFEEEE",
    },
    success: {
      "900": "#014D40",
      "800": "#0C6B58",
      "700": "#147D64",
      "600": "#199473",
      "500": "#27AB83",
      "400": "#3EBD93",
      "300": "#65D6AD",
      "200": "#8EEDC7",
      "100": "#C6F7E2",
      "50": "#EFFCF6",
    },
    background: {
      default: "#1F2933",
      paper: "#1F2933",
    },
    text: {
      primary: "#F5F7FA",
    },
  },
});
theme = responsiveFontSizes(theme);

type ExtendedAppProps<P> = AppProps<P> & {
  Component: NextComponentType & {
    auth?: boolean;
  };
  pageProps: P & {
    session: Session | null;
  };
};

export default function MyApp<P>({ Component, pageProps: { session, ...pageProps } }: ExtendedAppProps<P>) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
