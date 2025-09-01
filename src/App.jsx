import React, { useState } from "react";

// --- tiny UI
const Btn = ({ ghost, danger, className = "", ...p }) => (
  <button
    className={["px-3 py-1.5 rounded-lg text-sm border shadow-sm font-medium", danger
      ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
      : ghost
      ? "bg-blue-900/30 border-blue-700 text-blue-100 hover:bg-blue-900/50"
      : "bg-blue-800 border-blue-600 text-white hover:bg-blue-700",
      className,
    ].join(" ")}
    {...p}
  />
);
const Input = ({ className = "", ...p }) => (
  <input
    className={["border rounded-lg px-3 py-2 bg-slate-800 text-white border-slate-600 focus:border-blue-500 focus:outline-none", className,].join(" ")}
    {...p}
  />
);

// --- utils
const download = (name, textOrBlob, type = "text/plain;charset=utf-8") => {
  const blob =
    textOrBlob instanceof Blob ? textOrBlob : new Blob([textOrBlob], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 250);
};

// --- calculation helpers
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
};

const parseCurrency = (value) => {
  return parseFloat(value) || 0;
};

// --- Quote Calculator App
export default function App() {
  const [materials, setMaterials] = useState([{ name: '', cost: '', quantity: '' }]);
  const [equipment, setEquipment] = useState([{ name: '', cost: '', hours: '' }]);
  const [laborCost, setLaborCost] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [materialsMarkup, setMaterialsMarkup] = useState('');
  const [laborMarkup, setLaborMarkup] = useState('');

  // Add material row
  const addMaterial = () => {
    setMaterials([...materials, { name: '', cost: '', quantity: '' }]);
  };

  // Add equipment row  
  const addEquipment = () => {
    setEquipment([...equipment, { name: '', cost: '', hours: '' }]);
  };

  // Update material
  const updateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  // Update equipment
  const updateEquipment = (index, field, value) => {
    const updated = [...equipment];
    updated[index][field] = value;
    setEquipment(updated);
  };

  // Calculate totals
  const materialsTotal = materials.reduce((sum, material) => {
    return sum + (parseCurrency(material.cost) * parseCurrency(material.quantity));
  }, 0);

  const equipmentTotal = equipment.reduce((sum, equip) => {
    return sum + (parseCurrency(equip.cost) * parseCurrency(equip.hours));
  }, 0);

  const laborTotal = parseCurrency(laborCost) * parseCurrency(laborHours);

  const materialsMarkupAmount = materialsTotal * (parseCurrency(materialsMarkup) / 100);
  const laborMarkupAmount = laborTotal * (parseCurrency(laborMarkup) / 100);
  const markupAdjustment = materialsMarkupAmount + laborMarkupAmount;

  const grandTotal = materialsTotal + equipmentTotal + laborTotal + markupAdjustment;

  // Export functions
  const exportQuote = (includeMarkup = true) => {
    const data = {
      date: new Date().toLocaleDateString(),
      materials: materials.filter(m => m.name),
      equipment: equipment.filter(e => e.name),
      labor: { cost: laborCost, hours: laborHours },
      totals: {
        materials: materialsTotal,
        equipment: equipmentTotal,
        labor: laborTotal,
        ...(includeMarkup && {
          materialsMarkup: materialsMarkupAmount,
          laborMarkup: laborMarkupAmount,
          markupAdjustment: markupAdjustment
        }),
        grandTotal: includeMarkup ? grandTotal : materialsTotal + equipmentTotal + laborTotal
      }
    };
    download(`quote_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
  };

  const printQuote = (includeMarkup = true) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>LA Landscapes Quote</title></head>
        <body style="font-family: Arial, sans-serif; margin: 20px;">
          <h1>LA Landscapes</h1>
          <h2>Quote - ${new Date().toLocaleDateString()}</h2>
          <h3>Materials</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr><th>Name</th><th>Cost</th><th>Quantity</th><th>Total</th></tr>
            ${materials.filter(m => m.name).map(m => 
              `<tr><td>${m.name}</td><td>$${formatCurrency(m.cost)}</td><td>${m.quantity}</td><td>$${formatCurrency(parseCurrency(m.cost) * parseCurrency(m.quantity))}</td></tr>`
            ).join('')}
          </table>
          <h3>Equipment</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr><th>Name</th><th>Cost</th><th>Hours</th><th>Total</th></tr>
            ${equipment.filter(e => e.name).map(e => 
              `<tr><td>${e.name}</td><td>$${formatCurrency(e.cost)}</td><td>${e.hours}</td><td>$${formatCurrency(parseCurrency(e.cost) * parseCurrency(e.hours))}</td></tr>`
            ).join('')}
          </table>
          <h3>Labor</h3>
          <p>Cost per hour: $${formatCurrency(laborCost)}</p>
          <p>Hours: ${laborHours}</p>
          <p>Total: $${formatCurrency(laborTotal)}</p>
          
          <h3>Summary</h3>
          <p>Materials Total: $${formatCurrency(materialsTotal)}</p>
          <p>Equipment Total: $${formatCurrency(equipmentTotal)}</p>
          <p>Labor Total: $${formatCurrency(laborTotal)}</p>
          ${includeMarkup ? `
            <p>Markup Adjustment: $${formatCurrency(markupAdjustment)}</p>
          ` : ''}
          <h2>Grand Total: $${formatCurrency(includeMarkup ? grandTotal : materialsTotal + equipmentTotal + laborTotal)}</h2>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-100">LA</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-100">LA Landscapes</h1>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => exportQuote(true)}>Export</Btn>
            <Btn onClick={() => printQuote(true)}>Print</Btn>
            <Btn ghost onClick={() => exportQuote(false)}>Export (No Markup)</Btn>
            <Btn ghost onClick={() => printQuote(false)}>Print (No Markup)</Btn>
          </div>
        </div>

        {/* Materials Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-100">Materials</h2>
          <p className="text-slate-400 mb-4">Add materials with their costs and quantities</p>
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <Input
                  placeholder="Material name"
                  value={material.name}
                  onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Cost per unit"
                  type="number"
                  step="0.01"
                  value={material.cost}
                  onChange={(e) => updateMaterial(index, 'cost', e.target.value)}
                />
                <Input
                  placeholder="Quantity"
                  type="number"
                  step="0.01"
                  value={material.quantity}
                  onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                />
                <div className="px-3 py-2 bg-slate-700 rounded-lg flex items-center">
                  <span className="font-medium">${formatCurrency(parseCurrency(material.cost) * parseCurrency(material.quantity))}</span>
                </div>
              </div>
            ))}
            <Btn ghost onClick={addMaterial} className="w-full">+ Add Material</Btn>
          </div>
        </section>

        {/* Equipment Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-100">Equipment</h2>
          <p className="text-slate-400 mb-4">Add equipment with their costs and usage hours</p>
          <div className="space-y-3">
            {equipment.map((equip, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <Input
                  placeholder="Equipment name"
                  value={equip.name}
                  onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Cost per hour"
                  type="number"
                  step="0.01"
                  value={equip.cost}
                  onChange={(e) => updateEquipment(index, 'cost', e.target.value)}
                />
                <Input
                  placeholder="Hours"
                  type="number"
                  step="0.01"
                  value={equip.hours}
                  onChange={(e) => updateEquipment(index, 'hours', e.target.value)}
                />
                <div className="px-3 py-2 bg-slate-700 rounded-lg flex items-center">
                  <span className="font-medium">${formatCurrency(parseCurrency(equip.cost) * parseCurrency(equip.hours))}</span>
                </div>
              </div>
            ))}
            <Btn ghost onClick={addEquipment} className="w-full">+ Add Equipment</Btn>
          </div>
        </section>

        {/* Labor Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-100">Labor</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Labor cost per hour</label>
              <Input
                placeholder="Cost per hour"
                type="number"
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Labor hours</label>
              <Input
                placeholder="Total hours"
                type="number"
                step="0.01"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Labor total</label>
              <div className="px-3 py-2 bg-slate-700 rounded-lg">
                <span className="font-medium">${formatCurrency(laborTotal)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Markup Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-100">Markup %</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Materials markup %</label>
              <Input
                placeholder="Markup percentage"
                type="number"
                step="0.01"
                value={materialsMarkup}
                onChange={(e) => setMaterialsMarkup(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Labor markup %</label>
              <Input
                placeholder="Markup percentage"
                type="number"
                step="0.01"
                value={laborMarkup}
                onChange={(e) => setLaborMarkup(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Totals Summary */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-blue-100">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Materials Total</span>
              <span className="font-medium">${formatCurrency(materialsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment Total</span>
              <span className="font-medium">${formatCurrency(equipmentTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labor Total</span>
              <span className="font-medium">${formatCurrency(laborTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup Adjustment</span>
              <span className="font-medium">${formatCurrency(markupAdjustment)}</span>
            </div>
            <hr className="border-slate-600" />
            <div className="flex justify-between text-xl font-bold text-blue-100">
              <span>Grand Total</span>
              <span>${formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}