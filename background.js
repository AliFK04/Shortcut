chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get('keybinds', function(result) {
        var keybinds = result.keybinds || {};
        if (keybinds[command]) {
          // If the keybind is found in storage, open the URL in a new tab
          chrome.tabs.create({ url: keybinds[command] });
        }
    });
 });







chrome.commands.onCommand.addListener(function(command) {
    chrome.storage.sync.get(command, function(result) {
      if (result.hasOwnProperty(command)) {
        chrome.tabs.create({ url: result[command] });
      }
    });
  });