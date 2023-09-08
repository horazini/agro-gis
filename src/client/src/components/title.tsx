import { useEffect } from "react";

const PageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} - Nombre App`;
  }, [title]);

  return null;
};

export default PageTitle;
