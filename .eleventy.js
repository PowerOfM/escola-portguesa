export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  return {
    dir: {
      input: "pages",
      output: "build",
    },
  };
}
