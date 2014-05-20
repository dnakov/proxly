WebInspector = {}
Event.prototype.consume = function(preventDefault) 
{
    this.stopImmediatePropagation();
    if (preventDefault)
        this.preventDefault();
    this.handled = true;
}
WebInspector.UpgradeFileSystemDropTarget = (function() {
  function UpgradeFileSystemDropTarget() {}

  UpgradeFileSystemDropTarget.dragAndDropFilesType = "Files";
  UpgradeFileSystemDropTarget.prototype = {
 _onDragEnter: function(event) 
{
    if (event.dataTransfer.types.indexOf(WebInspector.UpgradeFileSystemDropTarget.dragAndDropFilesType) === -1)
        return;
    event.consume(true);
},_onDragOver: function(event) 
{
    if (event.dataTransfer.types.indexOf(WebInspector.UpgradeFileSystemDropTarget.dragAndDropFilesType) === -1)
        return;
    event.dataTransfer.dropEffect = "copy";
    event.consume(true);
    if (this._dragMaskElement)
        return;
    this._dragMaskElement = this._element.createChild("div", "fill drag-mask");
    this._dragMaskElement.createChild("div", "fill drag-mask-inner").textContent = WebInspector.UIString("Drop workspace folder here");
    this._dragMaskElement.addEventListener("drop", this._onDrop.bind(this), true);
    this._dragMaskElement.addEventListener("dragleave", this._onDragLeave.bind(this), true);
},_onDrop: function(event) 
{
    event.consume(true);
    this._removeMask();
    var items = (event.dataTransfer.items);
    if (!items.length)
        return;
    var entry = items[0].webkitGetAsEntry();
    if (!entry.isDirectory)
        return;
    InspectorFrontendHost.upgradeDraggedFileSystemPermissions(entry.filesystem);
},_onDragLeave: function(event) 
{
    event.consume(true);
    this._removeMask();
},_removeMask: function() 
{
    this._dragMaskElement.remove();
    delete this._dragMaskElement;
}}
  return UpgradeFileSystemDropTarget;

})(this);
module.exports = WebInspector
