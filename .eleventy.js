export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("sortByOrder", function (obj) {
    return Object.values(obj).sort((a, b) => a.order - b.order);
  });

  return {
    dir: {
      input: "pages",
      output: "build",
    },
  };
}
