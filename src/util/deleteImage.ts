import fs from "fs";
import path from "path";

export const deleteImage = (name: string) => {
  const pathName = path.join(__dirname, "../../public/images/" + name);
  if (fs.existsSync(pathName)) {
    fs.unlink(pathName, (err) => {
      if (err) return;
    });
  }
};
