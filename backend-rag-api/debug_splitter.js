try {
  const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
  console.log("Found RecursiveCharacterTextSplitter in langchain");
} catch (e) {
  console.log("Not found RecursiveCharacterTextSplitter in langchain:", e.message);
}
