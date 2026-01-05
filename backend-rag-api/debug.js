try {
  const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
  console.log("Found DirectoryLoader in langchain");
} catch (e) {
  console.log("Not found in langchain:", e.message);
}

try {
  const { DirectoryLoader } = require("@langchain/community/document_loaders/fs/directory");
  console.log("Found DirectoryLoader in community");
} catch (e) {
  console.log("Not found in community:", e.message);
}
