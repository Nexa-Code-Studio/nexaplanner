const { cert } = require('firebase-admin/app');

function parsePrivateKey(raw) {
  if (!raw) return "";
  let key = raw.trim();
  // Strip surrounding single or double quotes
  key = key.replace(/^["']|["']$/g, "");
  
  // If the key has no newlines but contains BEGIN and END headers,
  // it might have been flattened by Vercel or environment parsers.
  if (!key.includes("\n") && !key.includes("\r")) {
    const beginHeader = "-----BEGIN PRIVATE KEY-----";
    const endHeader = "-----END PRIVATE KEY-----";
    
    if (key.includes(beginHeader) && key.includes(endHeader)) {
      console.log("Detected flattened single-line key. Reconstructing...");
      let body = key
        .replace(beginHeader, "")
        .replace(endHeader, "")
        .replace(/\s+/g, ""); // remove all spaces
      
      const lines = [];
      for (let i = 0; i < body.length; i += 64) {
        lines.push(body.substring(i, i + 64));
      }
      
      return `${beginHeader}\n${lines.join("\n")}\n${endHeader}\n`;
    }
  }
  
  // Fallback for standard formatting
  key = key.replace(/\\\\n/g, "\n");
  key = key.replace(/\\n/g, "\n");
  return key.trim() + "\n";
}

// Simulate Vercel's flattened 1676 character key
const localRawKey = `"-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIv3NHPQlhVilL\\nS/ZIhEA1lI0vD1PADwNTnjDGV5hEJC/YJJzDCdp5tsuxnYaZWpuMioLEbvHPH7fP\\npXtV64ONX7Ak9yeUrOvKeMzizbJ1n6E1ESrINhc5ib6VmwRvvOFGRePS8hLm8EFd\\n0s5HqQPgTDa4KlFn6jrSkb9ZV5OkJPBx6LGVrPjI15BasmyUbMrpBULrOnuPo4k7\\nGtuh9Vlrsf6lpnQFc7AKNYFGf4BV5etJgzMYQX1QcSffOcnomftzkC1eZeSZ+HP1\\nNmzvO05lLgy27vJZMLcl0sddf55uFXs3Wbia3q84dXRVLbTd13T9lX4teBmDgXxc\\nakuocFsTAgMBAAECggEAHHvlzH7hnNkP5OozWNjDD5czbTD8jizTKQMyIoJ9TXXh\\nAAc54wa75DdGsb4LQik0Fv30ThD76Iq0lxcA6BERynaAVM5o5FSg5Eq9r5TGNKBg\\nzFnSOzRJmVVtIGctevlO8ZyrFdxZSEFg1QI7WLmnniTSQtFmWZtHm2cownGFtm1y\\nyx2Y4D089UvhkcWJEvigQjiOwqXtXXS+JJWvDHkDvJyHiVyl2VCiRgSBwJQbXkYO\\nGwjq2W942Jhn5ZoITZX8UkP6iTbuxEfRe34UpNfoZLvOVk6OLhvIeC32JgWsidNh\\nDwfHIvV8ciR9KjJ9wGMZaU4PUzXBzu0foeAJOZveQQKBgQD27vcA++HGLkFC6FlZ\\n2NchekEyPq7Rtnmglv9DZ23J+VQ++Jd0MqL/q6Iy7Nm8/XC/B1ElsGOmyskmHQ0H\\nYOB/+4VR4MqbYrSitNOx3N0BMetnkTudg4Rg4bVBZ4FrpBRSy7Ak692fkSP/0PzY\\nM7sdJIQH1A7OJOB/5zxq4+t7YQKBgQDQHl3o7mrWeWsHgL4/5TDCNrhdjyb8iZJs\\nTqjxZLslPzVbvuSR7OZy56cNITAMA4tE1xqSldwtrgISKoPP1mymKSlBe7/KhIZr\\nKYxE/5PsVSTiJnlsN3zcD+gpUs0KzU90uNVDHGsKNoCwGX6im38ZJr6Ug7jwD9cf\\nOlto24D+8wKBgQCroRY/MdMP+vBTP8lywFtuolmUQasiidDpxGmxgL73ZfufNQuX\\nsOZIDBRVjvgb+o+VxtEo//uTX1kFy6VVnokLi1dzvGk2LRneCQ8mjZtyjC7RMkmc\\nRmAJMnfX+Mgkd8vEbFyGnQXSNYAu+yPyZapFLC80fbi4oTsEy0TcCoSOoQKBgDZp\\nGghB/PChwdeuUw8Fbp/4Cm97c6fml791OToTKdJtGhgoaj20f/NemRAXsyYQ7yJK\\nUoosX+oZajUxpFB8MN+oNz8FiXj6+OGfdSq83wGUqRXvFSOzxhMKnZngKfc/Ahz0\\nDd2D2oBLC43+vFrq6Gm89WqCnaE1ovppGWjqqmj9AoGAFCIEWJyyiCztayqIeMMR\\nRFLFEEDRo5H5zRWc9h8dmNj63lo7Ya8+kVS/DTwiaNnmEoPgIVbBemAJjt22haul\\niBSR4R4wdQxE6Q7aP7qbVwbbSvFG5w8DKfJsDIjmXdFJ8kSXKVtOadMRd2yjqok5\\nyAfBzQnrZYDV7dK2vvqOBL8=\\n-----END PRIVATE KEY-----\\n"`;

// Strip all newlines to simulate Vercel's flattened key (1676 characters)
const vercelRawKey = localRawKey.replace(/\\n/g, "").replace(/\"/g, "");
console.log("Vercel Raw Key Length:", vercelRawKey.length);

try {
  const parsedKey = parsePrivateKey(vercelRawKey);
  console.log("Parsed Key starts with:", parsedKey.substring(0, 40));
  console.log("Parsed Key contains actual newlines?", parsedKey.includes("\n"));
  
  // Verify with cert
  cert({
    projectId: "test",
    clientEmail: "test@test.com",
    privateKey: parsedKey
  });
  console.log("✅ cert() succeeded on flattened key!");
} catch (e) {
  console.error("❌ Failed:", e.message);
}
