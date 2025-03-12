document.addEventListener('mouseup', function() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    console.log('选中的文字:', selectedText);
    // 可以在这里添加更多的逻辑来处理选中的文字
  }
}); 