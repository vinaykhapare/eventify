export function getBannerImageLink(req, res) {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No image file uploaded or invalid file format" });
  }
  return res.status(201).json({ url: req.file.path });
}
