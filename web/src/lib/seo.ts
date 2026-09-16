export function setSeo(title: string, description: string, image?: string) {
  document.title = `${title} | NhongAqui`;
  setMeta("description", description);
  setMeta("og:title", `${title} | NhongAqui`, "property");
  setMeta("og:description", description, "property");
  if (image) {
    setMeta("og:image", image, "property");
  }
}

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}
