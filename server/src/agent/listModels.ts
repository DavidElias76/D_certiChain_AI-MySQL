import ai from "./GeminimodelConnection"; // adjust to where your file is

const main = async () => {
  const pager = await ai.models.list();
  for await (const model of pager) {
    if (model.name?.includes("flash")) console.log(model.name);
  }
};

main().catch(console.error);