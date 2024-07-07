import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.cloverpick.com",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: "https://www.cloverpick.com/lotto",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: "https://www.cloverpick.com/pension",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
  ];
}
