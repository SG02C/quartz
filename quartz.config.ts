import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Simo's Philosophy Lessons",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "SG02C.github.io/quartz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf7f0",      // lighter parchment - background
          lightgray: "#a7c957",   // yellow-green - borders
          gray: "#6a994e",       // asparagus - graph links
          darkgray: "#2b2b2b",   // near black - body text (changed for better readability)
          dark: "#2b2b2b",       // near black - header text
          secondary: "#bc4749",   // bittersweet-shimmer - links
          tertiary: "#6a994e",   // asparagus - hover states
          highlight: "rgba(242, 232, 207, 0.3)", // parchment with transparency
          textHighlight: "#bc474988", // bittersweet-shimmer with transparency
        },
        darkMode: {
          light: "#011824",      // darker gunmetal - background
          lightgray: "#1f7a8c",   // teal - borders
          gray: "#bfdbf7",       // columbia-blue - graph links
          darkgray: "#e1e5f2",   // lavender-web - body text
          dark: "#ffffff",       // white - header text
          secondary: "#e1e5f2",   // lavender-web - links
          tertiary: "#1f7a8c",   // teal - hover states
          highlight: "rgba(191, 219, 247, 0.15)", // columbia-blue with transparency
          textHighlight: "#bc474988", // adding bittersweet-shimmer for accent
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
