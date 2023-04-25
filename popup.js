const KEYBINDINGS_STORAGE_KEY = 'keybindings';

function saveKeyBinding() {
  const keybindInput = document.getElementById('keybind');
  const urlInput = document.getElementById('url');
  const keybind = keybindInput.value;
  const url = urlInput.value;

  if (keybind.trim() === '' || url.trim() === '') {
    return;
  }

  chrome.storage.sync.get(KEYBINDINGS_STORAGE_KEY, (data) => {
    let keybindings = data[KEYBINDINGS_STORAGE_KEY] || [];
    keybindings.push({ keybind, url });
    chrome.storage.sync.set({ [KEYBINDINGS_STORAGE_KEY]: keybindings }, () => {
      renderKeyBindings(keybindings);
      keybindInput.value = '';
      urlInput.value = '';
    });
  });
}

function deleteKeyBinding(keybind, url) {
  chrome.storage.sync.get(KEYBINDINGS_STORAGE_KEY, (data) => {
    let keybindings = data[KEYBINDINGS_STORAGE_KEY] || [];
    keybindings = keybindings.filter((binding) => {
      return binding.keybind !== keybind || binding.url !== url;
    });
    chrome.storage.sync.set({ [KEYBINDINGS_STORAGE_KEY]: keybindings }, () => {
      renderKeyBindings(keybindings);
    });
  });
}

function renderKeyBindings(keybindings) {
  const tbody = document.querySelector('#keybinds tbody');
  tbody.innerHTML = '';

  keybindings.forEach((binding) => {
    const row = document.createElement('tr');
    const keybindCell = document.createElement('td');
    keybindCell.textContent = binding.keybind;
    const urlCell = document.createElement('td');
    urlCell.textContent = binding.url;
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteKeyBinding(binding.keybind, binding.url);
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(keybindCell);
    row.appendChild(urlCell);
    row.appendChild(deleteCell);
    tbody.appendChild(row);
  });
}

function registerKeybindings(keybindings) {
  chrome.commands.getAll((commands) => {
    const keyToUrl = {};
    commands.forEach((command) => {
      const matchingKeybinding = keybindings.find((binding) => {
        return binding.keybind === command.shortcut;
      });
      if (matchingKeybinding) {
        keyToUrl[command.name] = matchingKeybinding.url;
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      const tabId = activeInfo.tabId;
      chrome.tabs.get(tabId, (tab) => {
        const url = keyToUrl[tab.url];
        if (url) {
          chrome.tabs.create({ url });
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(KEYBINDINGS_STORAGE_KEY, (data) => {
    const keybindings = data[KEYBINDINGS_STORAGE_KEY] || [];
    renderKeyBindings(keybindings);
    registerKeybindings(keybindings);
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveKeyBinding();
  });
});

