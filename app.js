const form = document.querySelector("#generator-form");
const qrMode = document.querySelector("#qr-mode");
const pixFields = document.querySelector("#pix-fields");
const wifiFields = document.querySelector("#wifi-fields");
const wifiSecurity = document.querySelector("#wifi-security");
const wifiPassword = document.querySelector("#wifi-password");
const keyType = document.querySelector("#key-type");
const keyInput = document.querySelector("#pix-key");
const amountInput = document.querySelector("#pix-amount");
const cityInput = document.querySelector("#holder-city");
const descriptionInput = document.querySelector("#extra-info");
const keyHint = document.querySelector("#key-hint");
const photoInput = document.querySelector("#holder-photo");
const photoPreview = document.querySelector("#photo-preview");
const photoImage = document.querySelector("#photo-image");
const photoName = document.querySelector("#photo-name");
const formMessage = document.querySelector("#form-message");
const results = document.querySelector("#results");

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

let photoUrl = "";

form.addEventListener("input", invalidateResults);
form.addEventListener("change", invalidateResults);
qrMode.addEventListener("change", updateQrMode);
wifiSecurity.addEventListener("change", updateWifiSecurity);

const keyInstructions = {
  cpf: "Informe os 11 números do CPF; a formatação será conferida.",
  cnpj: "Informe os 14 caracteres do CNPJ; a formatação será conferida.",
  email: "Informe o endereço de e-mail cadastrado como chave Pix.",
  phone: "Use o formato internacional, por exemplo: +5511999999999.",
  random: "Informe a chave aleatória completa no formato UUID."
};

keyType.addEventListener("change", () => {
  keyInput.placeholder = {
    cpf: "000.000.000-00",
    cnpj: "00.000.000/0000-00",
    email: "nome@exemplo.com",
    phone: "+5511999999999",
    random: "00000000-0000-0000-0000-000000000000"
  }[keyType.value];
  keyHint.textContent = keyInstructions[keyType.value];
});

function updateQrMode() {
  const isPixMode = qrMode.value === "pix";
  const isWifiMode = qrMode.value === "wifi";
  pixFields.hidden = !isPixMode;
  wifiFields.hidden = !isWifiMode;
  keyInput.required = isPixMode;
  amountInput.disabled = !isPixMode;
  cityInput.disabled = isWifiMode;
  cityInput.required = !isWifiMode;
  descriptionInput.disabled = isWifiMode;
  descriptionInput.required = !isWifiMode;
  document.querySelector("#holder-city-field").hidden = isWifiMode;
  document.querySelector("#description-field").hidden = isWifiMode;
  document.querySelector("#description-hint").textContent = isPixMode
    ? "No modo Pix, esta descrição aparecerá no QR informativo do recebedor."
    : "Esta descrição aparecerá no QR informativo junto com o nome e a cidade.";
  document.querySelector("#generate-button").innerHTML = isPixMode
    ? '<span aria-hidden="true">✦</span> Gerar meus QR Codes Pix'
    : isWifiMode
      ? '<span aria-hidden="true">✦</span> Gerar QR de acesso Wi-Fi'
      : '<span aria-hidden="true">✦</span> Gerar QR Code informativo';
  document.querySelector("#holder-name").closest(".field").querySelector("span").textContent = isWifiMode
    ? "Nome do titular da rede (opcional)"
    : "Nome do titular";
  document.querySelector("#holder-name").required = !isWifiMode;
  document.querySelector("#form-section-title").textContent = isWifiMode
    ? "Dados da rede"
    : "Dados do titular";
  document.querySelector("#form-section-description").textContent = isWifiMode
    ? "Informe o nome e a segurança da rede para gerar um QR de conexão."
    : "Preencha os dados do recebedor e escolha se deseja gerar um QR Pix ou informativo.";
  if (!isWifiMode && wifiPassword.type === "text") {
    wifiPassword.type = "password";
    const toggleButton = document.querySelector("#toggle-wifi-password");
    toggleButton.textContent = "Mostrar";
    toggleButton.setAttribute("aria-label", "Mostrar senha do Wi-Fi");
    toggleButton.setAttribute("aria-pressed", "false");
  }
  updateWifiSecurity();
}

function updateWifiSecurity() {
  const isOpenNetwork = wifiSecurity.value === "nopass";
  const isWifiMode = qrMode.value === "wifi";
  document.querySelector("#wifi-password-field").hidden = isOpenNetwork;
  wifiPassword.required = isWifiMode && !isOpenNetwork;
  wifiPassword.disabled = !isWifiMode || isOpenNetwork;
  if (isOpenNetwork) {
    wifiPassword.value = "";
    wifiPassword.type = "password";
    const toggleButton = document.querySelector("#toggle-wifi-password");
    toggleButton.textContent = "Mostrar";
    toggleButton.setAttribute("aria-label", "Mostrar senha do Wi-Fi");
    toggleButton.setAttribute("aria-pressed", "false");
    document.querySelector("#wifi-password-hint").textContent = "Esta rede não usa senha.";
  } else {
    wifiPassword.disabled = wifiFields.hidden;
    document.querySelector("#wifi-password-hint").textContent = wifiSecurity.value === "WPA"
      ? "Use de 8 a 63 bytes para a senha WPA."
      : "WEP aceita 5 ou 13 caracteres, ou uma senha hexadecimal.";
  }
}

photoInput.addEventListener("change", () => {
  clearFormMessage();
  const [file] = photoInput.files;
  if (!file) {
    clearPhoto();
    return;
  }
  if (!file.type.startsWith("image/")) {
    photoInput.value = "";
    clearPhoto();
    showFormMessage("Selecione um arquivo de imagem válido.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    photoInput.value = "";
    clearPhoto();
    showFormMessage("A foto deve ter no máximo 5 MB.");
    return;
  }

  clearPhoto();
  photoUrl = URL.createObjectURL(file);
  photoImage.src = photoUrl;
  photoName.textContent = file.name;
  photoPreview.hidden = false;
});

document.querySelector("#remove-photo").addEventListener("click", () => {
  photoInput.value = "";
  clearPhoto();
  invalidateResults();
});

document.querySelector("#toggle-wifi-password").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isVisible = wifiPassword.type === "text";
  wifiPassword.type = isVisible ? "password" : "text";
  button.textContent = isVisible ? "Mostrar" : "Ocultar";
  button.setAttribute("aria-label", `${isVisible ? "Mostrar" : "Ocultar"} senha do Wi-Fi`);
  button.setAttribute("aria-pressed", String(!isVisible));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormMessage();

  const data = {
    mode: qrMode.value,
    name: document.querySelector("#holder-name").value.trim(),
    keyType: keyType.value,
    key: keyInput.value.trim(),
    city: document.querySelector("#holder-city").value.trim(),
    amount: document.querySelector("#pix-amount").value.trim(),
    extraInfo: document.querySelector("#extra-info").value.trim(),
    wifiSsid: document.querySelector("#wifi-ssid").value,
    wifiPassword: wifiPassword.value,
    wifiSecurity: wifiSecurity.value,
    wifiHidden: document.querySelector("#wifi-hidden").checked,
    photo: photoInput.files[0]
  };

  const validationError = validateForm(data);
  if (validationError) {
    showFormMessage(validationError);
    return;
  }

  try {
    const isPixMode = data.mode === "pix";
    const isWifiMode = data.mode === "wifi";
    const normalizedKey = isPixMode ? normalizePixKey(data.key, data.keyType) : "";
    const payload = isPixMode
      ? buildPixPayload({
        name: data.name,
        key: normalizedKey,
        city: data.city,
        amount: parseAmount(data.amount)
      })
      : "";
    const infoText = isWifiMode
      ? buildWifiPayload(data.wifiSsid, data.wifiPassword, data.wifiSecurity, data.wifiHidden)
      : isPixMode
        ? buildPixInfoText(data.name, normalizedKey, data.extraInfo, data.city)
        : buildGeneralInfoText(data.name, data.city, data.extraInfo);

    const pixCard = document.querySelector("#pix-card");
    const infoCard = document.querySelector("#info-card");
    pixCard.hidden = !isPixMode;
    infoCard.hidden = isPixMode;
    document.querySelector("#download-info-qr").dataset.filename = isWifiMode
      ? "acesso-wifi.png"
      : "informacoes-titular.png";
    document.querySelector("#download-info-qr").textContent = isWifiMode
      ? "Baixar QR Wi-Fi"
      : "Baixar QR informativo";
    if (isPixMode) {
      renderQr("#pix-qr", payload);
      document.querySelector("#info-qr").replaceChildren();
    } else {
      document.querySelector("#pix-qr").replaceChildren();
      renderQr("#info-qr", infoText);
    }
    document.querySelector("#pix-payload").value = payload;
    document.querySelector("#result-photo").src = photoUrl;
    document.querySelector("#result-name").textContent = isWifiMode
      ? data.name || "Rede Wi-Fi"
      : data.name;
    document.querySelector("#profile-label").textContent = isWifiMode
      ? data.name ? "TITULAR DA REDE" : "REDE WI-FI"
      : "TITULAR";
    document.querySelector("#result-key").textContent = isPixMode
      ? `Chave Pix: ${normalizedKey}`
      : isWifiMode
        ? `Rede Wi-Fi: ${data.wifiSsid}`
        : `Cidade: ${data.city}`;
    document.querySelector("#results-title").textContent = isPixMode
      ? "Cartão de pagamento Pix"
      : isWifiMode
        ? "Cartão de acesso Wi-Fi"
        : "Cartão informativo";
    document.querySelector("#result-note").textContent = isPixMode
      ? "A foto aparece no cartão, mas não é inserida nos QR Codes. Confira o nome do recebedor ao testar o Pix."
      : isWifiMode
        ? "O QR contém a senha da rede. Quem escanear poderá visualizar a senha e solicitar a conexão. A foto não faz parte do QR."
        : "Este cartão contém um QR Code com o nome, a cidade e a descrição informados. A foto não faz parte do QR.";
    document.querySelector("#info-qr-label").lastChild.textContent = isPixMode
      ? " INFORMAÇÕES DO RECEBEDOR"
      : isWifiMode
        ? " ACESSO WI-FI"
        : " INFORMAÇÕES GERAIS";
    document.querySelector("#info-qr-description").textContent = isPixMode
      ? "Nome, chave Pix, descrição do serviço e cidade"
      : isWifiMode
        ? `Escaneie para conectar à rede ${data.wifiSsid}`
        : "Nome, cidade e descrição informados";
    document.querySelector("#info-qr").setAttribute(
      "aria-label",
      isPixMode
        ? "QR Code com os dados do recebedor Pix"
        : isWifiMode
          ? "QR Code de acesso à rede Wi-Fi"
          : "QR Code com todas as informações gerais"
    );
    document.querySelector("#qr-grid").classList.add("single-qr");
    document.querySelector("#payload-details").hidden = !isPixMode;
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showFormMessage(`Não foi possível gerar os QR Codes: ${error.message}`);
  }
});

document.querySelectorAll(".download-qr").forEach((button) => {
  button.addEventListener("click", () => {
    const canvas = document.querySelector(`#${button.dataset.target} canvas`);
    if (!canvas) {
      showFormMessage("Gere os QR Codes antes de baixá-los.");
      return;
    }
    downloadDataUrl(canvas.toDataURL("image/png"), button.dataset.filename);
  });
});

document.querySelector("#download-card").addEventListener("click", async () => {
  try {
    const card = await drawCard();
    downloadDataUrl(card.toDataURL("image/png"), "cartao-titular.png");
  } catch (error) {
    showFormMessage(`Não foi possível montar o cartão: ${error.message}`);
  }
});

document.querySelector("#copy-payload").addEventListener("click", async () => {
  const copyMessage = document.querySelector("#copy-message");
  try {
    await navigator.clipboard.writeText(document.querySelector("#pix-payload").value);
    copyMessage.textContent = "Código Pix copiado.";
  } catch {
    copyMessage.textContent = "Não foi possível copiar automaticamente. Selecione o código acima e copie.";
  }
});

function validateForm(data) {
  if (data.mode !== "wifi" && !data.name) return "Informe o nome do titular.";
  if (!data.photo) return "Escolha uma foto do titular.";

  if (data.mode === "wifi") {
    if (!data.wifiSsid.trim()) return "Informe o nome da rede Wi-Fi (SSID).";
    if (/[\u0000-\u001f\u007f]/.test(data.wifiSsid)) return "O nome da rede contém caracteres não permitidos.";
    if (new TextEncoder().encode(data.wifiSsid).length > 32) return "O nome da rede deve ter no máximo 32 bytes.";
    if (data.wifiSecurity === "WPA" && !/^[\x20-\x7E]{8,63}$/.test(data.wifiPassword)) {
      return "A senha WPA deve ter de 8 a 63 caracteres ASCII.";
    }
    if (data.wifiSecurity === "WEP" && !(
      /^[\x20-\x7E]{5}$/.test(data.wifiPassword)
      || /^[\x20-\x7E]{13}$/.test(data.wifiPassword)
      || /^(?:[0-9a-fA-F]{10}|[0-9a-fA-F]{26})$/.test(data.wifiPassword)
    )) {
      return "A senha WEP deve ter 5 ou 13 caracteres, ou 10 ou 26 dígitos hexadecimais.";
    }
    return "";
  }

  if (!data.city) return "Informe a cidade do titular.";
  if (!data.extraInfo) return "Informe a descrição do serviço prestado.";

  if (data.mode === "pix") {
    if (!toPixText(data.name, 25)) return "O nome precisa conter letras ou números para o QR Pix.";
    if (!toPixText(data.city, 15)) return "A cidade precisa conter letras ou números para o QR Pix.";
    if (!data.key) return "Informe a chave Pix.";
    if (!isValidPixKey(data.key, data.keyType)) {
      return `A chave não parece estar no formato esperado para ${data.keyType.toUpperCase()}. Confira a chave e o tipo selecionado.`;
    }
    if (data.amount && !/^\d+(?:[.,]\d{1,2})?$/.test(data.amount)) {
      return "Informe um valor válido, usando até duas casas decimais (por exemplo, 12,50).";
    }
    if (data.amount && /^0+$/.test(data.amount.replace(/\D/g, ""))) {
      return "O valor da cobrança deve ser maior que zero.";
    }
  }
  return "";
}

function isValidPixKey(value, type) {
  if (type === "cpf") {
    const digits = value.replace(/\D/g, "");
    return /^\d{11}$/.test(digits) && isValidCpf(digits);
  }
  if (type === "cnpj") {
    const cnpj = value.replace(/[.\-/\s]/g, "").toUpperCase();
    return /^[A-Z0-9]{12}\d{2}$/.test(cnpj) && isValidCnpj(cnpj);
  }
  if (type === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }
  if (type === "phone") {
    return /^\+55[1-9]\d{9,10}$/.test(value.replace(/[\s().-]/g, ""));
  }
  return type === "random" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidCpf(value) {
  if (/^(\d)\1{10}$/.test(value)) return false;
  const digits = [...value].map(Number);
  for (let position = 9; position <= 10; position += 1) {
    const sum = digits.slice(0, position).reduce((total, digit, index) => total + digit * (position + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    if (digits[position] !== (remainder === 10 ? 0 : remainder)) return false;
  }
  return true;
}

function isValidCnpj(value) {
  if (/^(\w)\1{13}$/.test(value)) return false;
  const calculateDigit = (characters) => {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9];
    const sum = [...characters].reverse().reduce(
      (total, character, index) => total + (character.charCodeAt(0) - 48) * weights[index % weights.length],
      0
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstDigit = calculateDigit(value.slice(0, 12));
  const secondDigit = calculateDigit(value.slice(0, 12) + firstDigit);
  return value.slice(-2) === `${firstDigit}${secondDigit}`;
}

function normalizePixKey(value, type) {
  if (type === "cpf") return value.replace(/\D/g, "");
  if (type === "cnpj") return value.replace(/[.\-/\s]/g, "").toUpperCase();
  if (type === "phone") return value.replace(/[\s().-]/g, "");
  return value;
}

function parseAmount(value) {
  if (!value) return "";
  const [integer, fraction = ""] = value.replace(",", ".").split(".");
  return `${integer.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`;
}

function buildPixPayload({ name, key, city, amount }) {
  const pixAccount = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", key);
  const fields = [
    tlv("00", "01"),
    tlv("26", pixAccount),
    tlv("52", "0000"),
    tlv("53", "986")
  ];
  if (amount) fields.push(tlv("54", amount));
  fields.push(
    tlv("58", "BR"),
    tlv("59", toPixText(name, 25)),
    tlv("60", toPixText(city, 15)),
    tlv("62", tlv("05", "***"))
  );
  const withoutCrc = fields.join("") + "6304";
  return withoutCrc + crc16(withoutCrc);
}

function tlv(id, value) {
  const length = new TextEncoder().encode(value).length;
  if (length > 99) throw new Error("um dos campos excede o limite do formato Pix.");
  return `${id}${String(length).padStart(2, "0")}${value}`;
}

function toPixText(value, maxLength) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .,'&*/:#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

function crc16(value) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(value)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixInfoText(name, key, description, city) {
  return [
    "INFORMACOES DO RECEBEDOR PIX",
    `Nome do recebedor: ${name}`,
    `Chave Pix: ${key}`,
    `Descricao do servico: ${description}`,
    `Cidade: ${city}`
  ].join("\n");
}

function buildGeneralInfoText(name, city, description) {
  return [
    "INFORMACOES GERAIS",
    `Nome: ${name}`,
    `Cidade: ${city}`,
    `Descricao: ${description}`
  ].join("\n");
}

function buildWifiPayload(ssid, password, security, hidden) {
  const escapeWifiValue = (value) => value.replace(/([\\;,:"])/g, "\\$1");
  const fields = [
    `T:${security}`,
    `S:${escapeWifiValue(ssid)}`,
    security === "nopass" ? "" : `P:${escapeWifiValue(password)}`,
    `H:${hidden ? "true" : "false"}`
  ].filter(Boolean);
  return `WIFI:${fields.join(";")};;`;
}

function renderQr(selector, text) {
  const element = document.querySelector(selector);
  element.replaceChildren();
  const qr = qrcode(0, "L");
  qr.addData(text, "Byte");
  qr.make();

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const moduleCount = qr.getModuleCount();
  const quietZone = 4;
  const scale = 600 / (moduleCount + quietZone * 2);
  canvas.width = 600;
  canvas.height = 600;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#152d27";

  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (qr.isDark(row, column)) {
        context.fillRect(
          (column + quietZone) * scale,
          (row + quietZone) * scale,
          scale + 0.25,
          scale + 0.25
        );
      }
    }
  }
  element.append(canvas);
}

function drawCard() {
  const isPixMode = qrMode.value === "pix";
  const isWifiMode = qrMode.value === "wifi";
  const cardHeight = 1160;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = cardHeight;
  const context = canvas.getContext("2d");
  const photo = new Image();
  const brandLogo = new Image();
  const pixQr = new Image();
  const infoQr = new Image();
  const photoSource = photoUrl;
  const images = [
    loadImage(photo, photoSource),
    loadImage(brandLogo, "./assets/essencia-prime.jpg")
  ];
  if (isPixMode) {
    const pixSource = document.querySelector("#pix-qr canvas").toDataURL("image/png");
    images.push(loadImage(pixQr, pixSource));
  } else {
    const infoSource = document.querySelector("#info-qr canvas").toDataURL("image/png");
    images.push(loadImage(infoQr, infoSource));
  }

  return Promise.all(images).then(() => {
    context.fillStyle = "#f3f6f2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    roundedRect(context, 35, 35, 1010, cardHeight - 70, 30, "#ffffff");

    context.fillStyle = "#123d35";
    context.fillRect(35, 35, 1010, 205);
    context.save();
    context.beginPath();
    context.roundRect(72, 56, 156, 156, 19);
    context.clip();
    context.drawImage(brandLogo, 72, 56, 156, 156);
    context.restore();

    context.fillStyle = "#b5d8c2";
    context.font = "700 23px Arial, sans-serif";
    context.fillText("BELEZA, COSMÉTICOS E CUIDADOS PESSOAIS.", 265, 111);
    context.fillStyle = "#ffffff";
    context.font = "700 50px Arial, sans-serif";
    context.fillText("ESSENCIA PRIME", 265, 177);

    context.save();
    context.beginPath();
    context.arc(165, 340, 86, 0, Math.PI * 2);
    context.clip();
    drawCover(context, photo, 79, 254, 172, 172);
    context.restore();

    const name = document.querySelector("#result-name").textContent;
    const key = document.querySelector("#result-key").textContent;
    context.fillStyle = "#19312c";
    context.font = "700 32px Arial, sans-serif";
    context.fillText(trimCanvasText(context, name, 650), 290, 320);
    context.fillStyle = "#74827b";
    context.font = "20px Arial, sans-serif";
    context.fillText(trimCanvasText(context, key, 690), 290, 365);
    context.fillText("Foto exibida no cartao; nao faz parte dos QR Codes.", 290, 407);

    if (isPixMode) {
      drawQrPanel(context, pixQr, 220, 475, 640, 570, "PAGAMENTO PIX", "Escaneie no app do banco", 390);
    } else if (isWifiMode) {
      drawQrPanel(
        context,
        infoQr,
        220,
        475,
        640,
        570,
        "ACESSO WI-FI",
        trimCanvasText(context, document.querySelector("#wifi-ssid").value, 500),
        390
      );
    } else {
      drawQrPanel(context, infoQr, 220, 475, 640, 570, "INFORMACOES GERAIS", "Nome, cidade e descricao do servico", 390);
    }

    context.fillStyle = "#7c8983";
    context.font = "16px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(
      isPixMode
        ? "Confirme o nome do recebedor no aplicativo do seu banco antes de pagar."
        : isWifiMode
          ? "O QR revela a senha da rede. Compartilhe somente com quem deve ter acesso."
          : "A foto aparece no cartao e nao faz parte do QR Code.",
      540,
      cardHeight - 65
    );
    context.textAlign = "start";
    return canvas;
  });
}

function drawQrPanel(context, qr, x, y, width, height, title, subtitle, qrSize) {
  roundedRect(context, x, y, width, height, 22, "#fbfcfa", "#e6ebe6");
  context.fillStyle = "#53675e";
  context.font = "700 21px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(title, x + width / 2, y + 49);
  context.drawImage(qr, x + (width - qrSize) / 2, y + 80, qrSize, qrSize);
  context.fillStyle = "#74827b";
  context.font = "18px Arial, sans-serif";
  context.fillText(subtitle, x + width / 2, y + height - 40);
  context.textAlign = "start";
}

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function roundedRect(context, x, y, width, height, radius, fill, stroke = "") {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = 2;
    context.stroke();
  }
}

function trimCanvasText(context, text, maxWidth) {
  if (context.measureText(text).width <= maxWidth) return text;
  let shortened = text;
  while (shortened.length && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened}…`;
}

function loadImage(image, source) {
  return new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("uma imagem do cartão não pôde ser carregada."));
    image.src = source;
  });
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function showFormMessage(message) {
  formMessage.textContent = message;
  formMessage.hidden = false;
  formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.hidden = true;
}

function invalidateResults() {
  results.hidden = true;
}

function clearPhoto() {
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = "";
  photoImage.removeAttribute("src");
  photoName.textContent = "";
  photoPreview.hidden = true;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Não foi possível registrar o modo offline:", error);
    });
  });
}

keyType.dispatchEvent(new Event("change"));
updateQrMode();
