import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ConsumptionReport = () => {
  const [title, setTitle] = useState('OFFER');
  const [seedsInput, setSeedsInput] = useState('99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99');
  const [activeInput, setActiveInput] = useState('80\n97\n83\n91\n99\n99\n99\n99\n94\n96\n98\n98\n96\n97\n98');
  const [sessionsOutInput, setSessionsOutInput] = useState('All sessions completed successfully with no issues reported during the campaign period.');
  const [tableData, setTableData] = useState([]);
  const [totals, setTotals] = useState({ seeds: 0, active: 0, blocked: 0 });
  const [isSending, setIsSending] = useState(false);
  const [selectedCMH, setSelectedCMH] = useState('cmh1');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // CMH configurations
  const cmhConfigs = {
    cmh1: {
      BOT_TOKEN: "8264293111:AAF_WCJJLabD5S3alNmgNvQOuGu3zukzoRs",
      CHAT_ID: "8304177747"
    },
    cmh2: {
      BOT_TOKEN: "8529644027:AAEVaCDf4EMOKgu0oalJkD94tEISKsa3NzY",
      CHAT_ID: "8304177747"
    },
    cmh3: {
      BOT_TOKEN: "8229900745:AAH4j_U_10-pWaC-gyeQOa0WIFBrv36pRY8",
      CHAT_ID: "8304177747"
    }
  };

  // Get current CMH configuration
  const getCurrentConfig = () => {
    return cmhConfigs[selectedCMH];
  };

  useEffect(() => {
    generateTableAndChart();
  }, []);

  const parseInput = (input) => {
    return input.split('\n')
                .map(value => value.trim())
                .filter(value => value !== '');
  };

  const generateTableAndChart = () => {
    const seedsValues = parseInput(seedsInput);
    const activeValues = parseInput(activeInput);
    
    if (seedsValues.length !== activeValues.length) {
      alert('Error: The number of values in both columns must be the same.');
      return;
    }
    
    let totalSeeds = 0;
    let totalActive = 0;
    let totalBlocked = 0;
    
    const newTableData = seedsValues.map((seeds, i) => {
      const seedsNum = parseInt(seeds) || 0;
      const activeNum = parseInt(activeValues[i]) || 0;
      const blockedNum = seedsNum - activeNum;
      
      totalSeeds += seedsNum;
      totalActive += activeNum;
      totalBlocked += blockedNum;
      
      return {
        dropNumber: i + 1,
        seeds: seedsNum,
        active: activeNum,
        blocked: blockedNum
      };
    });
    
    setTableData(newTableData);
    setTotals({ seeds: totalSeeds, active: totalActive, blocked: totalBlocked });
    generateChart(newTableData);
  };

  const generateChart = (data) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    
    const drops = data.map(row => `Drop ${row.dropNumber}`);
    const activeData = data.map(row => row.active);
    const blockedData = data.map(row => row.blocked);

    try {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: drops,
          datasets: [
            {
              label: 'Seeds Active',
              data: activeData,
              backgroundColor: 'rgba(107, 142, 35, 0.7)', 
              borderColor: 'rgba(107, 142, 35, 1)',
              borderWidth: 1
            },
            {
              label: 'Seeds Blocked',
              data: blockedData,
              backgroundColor:'rgba(128, 0, 32, 0.7)',  
              borderColor: 'rgba(128, 0, 32, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Drops'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Seeds'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Active vs Blocked Seeds by Drop'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const clearData = () => {
    setSeedsInput('');
    setActiveInput('');
    setSessionsOutInput('');
    setTitle('OFFER');
    setTableData([]);
    setTotals({ seeds: 0, active: 0, blocked: 0 });
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  const generateHTMLContent = () => {
    const seedsValues = parseInput(seedsInput);
    const activeValues = parseInput(activeInput);
    
    let totalSeeds = 0;
    let totalActive = 0;
    let totalBlocked = 0;
    
    seedsValues.forEach((seeds, i) => {
      const seedsNum = parseInt(seeds) || 0;
      const activeNum = parseInt(activeValues[i]) || 0;
      const blockedNum = seedsNum - activeNum;
      
      totalSeeds += seedsNum;
      totalActive += activeNum;
      totalBlocked += blockedNum;
    });

    const activePercentage = Math.round((totalActive/totalSeeds)*100);
    const blockedPercentage = Math.round((totalBlocked/totalSeeds)*100);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - Consumption Report</title>
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f8f6f2;
    color: #2c3e50;
    line-height: 1.4;
    padding: 8px;
    font-size: 11px;
    height: 100vh;
    overflow: hidden;
  }
  
  .container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 10px;
    height: 100%;
    max-height: 100vh;
  }
  
  .header {
    grid-column: 1 / -1;
    text-align: center;
    margin-bottom: 8px;
    padding: 8px;
    border-bottom: 2px solid #800020;
  }
  
  .title {
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #800020, #6B8E23);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 4px;
  }
  
  .subtitle {
    color: #7f8c8d;
    font-size: 0.7rem;
  }
  
  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .stats-panel {
    background: rgba(128, 0, 32, 0.05);
    border-radius: 8px;
    padding: 10px;
    border: 1px solid #e1e5e9;
  }
  
  .stat-item {
    margin-bottom: 6px;
    padding: 4px 0;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    justify-content: space-between;
  }
  
  .stat-item:last-child {
    border-bottom: none;
  }
  
  .stat-value {
    font-weight: 700;
    color: #800020;
  }
  
  .diagram-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border: 1px solid #e1e5e9;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .diagram-title {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #2c3e50;
    text-align: center;
  }
  
  .chart-container {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto;
  }
  
  .pie-chart {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    background: conic-gradient(
      #6B8E23 0% ${activePercentage}%,
      #800020 ${activePercentage}% 100%
    );
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
  }
  
  .chart-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border: 1px solid #e1e5e9;
  }
  
  .total-count {
    font-size: 0.9rem;
    font-weight: 700;
    color: #B8860B;
    line-height: 1;
  }
  
  .total-label {
    font-size: 0.6rem;
    color: #7f8c8d;
    margin-top: 2px;
  }
  
  .diagram-legend {
    margin-top: 10px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    padding: 4px 6px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #e1e5e9;
  }
  
  .legend-color {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    margin-right: 5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .legend-label {
    flex: 1;
    font-size: 0.7rem;
    font-weight: 500;
  }
  
  .legend-percentage {
    font-weight: 700;
    color: #B8860B;
    margin-left: 3px;
    font-size: 0.7rem;
  }
  
  .legend-count {
    font-size: 0.65rem;
    color: #7f8c8d;
    margin-left: 3px;
  }
  
  .table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border: 1px solid #e1e5e9;
    overflow: auto;
    height: 100%;
  }
  
  .table-container h3 {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #2c3e50;
    position: sticky;
    top: 0;
    background: white;
    padding: 5px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    overflow: hidden;
  }
  
  th {
    background: linear-gradient(135deg, #800020, #5A0017);
    padding: 6px 4px;
    text-align: left;
    border-bottom: 2px solid #e1e5e9;
    font-weight: 600;
    color: white;
    font-size: 0.7rem;
    position: sticky;
    top: 0;
  }
  
  td {
    padding: 4px;
    border-bottom: 1px solid #e1e5e9;
    font-size: 0.65rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .totals-row {
    background: linear-gradient(135deg, rgba(128, 0, 32, 0.1), rgba(107, 142, 35, 0.1));
    font-weight: 600;
    position: sticky;
    bottom: 0;
  }
  
  footer {
    grid-column: 1 / -1;
    text-align: center;
    margin-top: 8px;
    padding: 6px;
    color: #7f8c8d;
    border-top: 1px solid #e1e5e9;
    font-size: 0.65rem;
  }
  
  /* Compact table styling for many rows */
  .compact-table {
    max-height: calc(100vh - 200px);
  }
  
  .compact-table tbody {
    display: block;
    max-height: calc(100vh - 250px);
    overflow-y: auto;
  }
  
  .compact-table thead, .compact-table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${title}</h1>
      <p class="subtitle">Consumption Report - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
    </div>
    
    <div class="left-panel">
      <div class="stats-panel">
        <div class="stat-item">
          <span>Total Consumption: </span>
          <span class="stat-value">${totalSeeds}</span>
        </div>
        <div class="stat-item">
          <span>Total Seeds Active: </span>
          <span class="stat-value">${totalActive}</span>
        </div>
        <div class="stat-item">
          <span>Total Seeds Blocked: </span>
          <span class="stat-value">${totalBlocked}</span>
        </div>
      </div>
      
      <div class="diagram-container">
        <h3 class="diagram-title">Consumption Overview</h3>
        <div class="chart-container">
          <div class="pie-chart">
            <div class="chart-center">
              <div class="total-count">${totalSeeds}</div>
              <div class="total-label">Total</div>
            </div>
          </div>
        </div>
        <div class="diagram-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #6B8E23;"></div>
            <span class="legend-label">Active Seeds</span>
            <span class="legend-percentage">${activePercentage}%</span>
            <span class="legend-count">(${totalActive})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #800020;"></div>
            <span class="legend-label">Blocked Seeds</span>
            <span class="legend-percentage">${blockedPercentage}%</span>
            <span class="legend-count">(${totalBlocked})</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3>Detailed Data</h3>
      <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
        <thead>
          <tr>
            <th style="width: 15%">Drop N°</th>
            <th style="width: 25%">CONSOMMATION SEEDS</th>
            <th style="width: 20%">ACTIVE/DROP</th>
            <th style="width: 20%">BLOCKED</th>
            <th style="width: 20%">SESSIONS OUT</th>
          </tr>
        </thead>
        <tbody>
          ${seedsValues.map((seeds, i) => {
            const dropNumber = i + 1;
            const active = parseInt(activeValues[i]) || 0;
            const blocked = parseInt(seeds) - active;
            return `
              <tr>
                <td>${dropNumber}</td>
                <td>${seeds}</td>
                <td>${active}</td>
                <td>${blocked}</td>
                <td>${sessionsOutInput}</td>
              </tr>
            `;
          }).join('')}
          <tr class="totals-row">
            <td colspan="2">TOTAL: ${totalSeeds}</td>
            <td>ACTIVE: ${totalActive}</td>
            <td>BLOCKED: ${totalBlocked}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <footer>
      <p>CMHW</p>
    </footer>
  </div>
</body>
</html>
    `;
  };

  const exportAsHTML = () => {
    const htmlContent = generateHTMLContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_consumption_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendToTelegram = async () => {
    const { BOT_TOKEN, CHAT_ID } = getCurrentConfig();
    
    if (!BOT_TOKEN || !CHAT_ID) {
      alert('Please configure BOT_TOKEN and CHAT_ID first.');
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = generateHTMLContent();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("document", blob, `${title.replace(/\s+/g, "_")}_consumption_report.html`);
      formData.append("caption", `📊 ${title} - Consumption Report\nGenerated on ${new Date().toLocaleDateString()}\nSent via ${selectedCMH.toUpperCase()}`);

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert(`Report sent to Telegram via ${selectedCMH.toUpperCase()} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to send report via ${selectedCMH.toUpperCase()}: ${errorData.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      alert(`Error sending report to Telegram via ${selectedCMH.toUpperCase()}. Please check console for details.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="consumption-section" className="content-section active">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 id="dashboard-title" className="dashboard-title">{title}</h1>
          <p className="dashboard-subtitle" id="current-date">
            {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>

        <div className="dashboard-input-section">
          <div className="input-row">
            <label htmlFor="title-input" className="input-label">Title</label>
            <input 
              type="text" 
              className="dashboard-textarea" 
              id="title-input" 
              placeholder="Enter title (e.g., OFFER)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)'
              }}
            />
          </div>

          <div className="input-row">
            <label htmlFor="cmh-select" className="input-label">Select CMH</label>
            <select 
              id="cmh-select"
              value={selectedCMH}
              onChange={(e) => setSelectedCMH(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)',
                fontSize: '11.2px',
                fontWeight: '600'
              }}
            >
              <option value="cmh1">CMH 1</option>
              <option value="cmh2">CMH 2</option>
              <option value="cmh3">CMH 3</option>
            </select>
          </div>
          
          <div className="results-row">
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="seeds-input" className="input-label">Consommation Seeds (Active + Blocked)</label>
              <textarea 
                className="dashboard-textarea" 
                id="seeds-input" 
                placeholder="Enter values (one per line)"
                value={seedsInput}
                onChange={(e) => setSeedsInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="active-input" className="input-label">Nbr Boites Active/Drop</label>
              <textarea 
                className="dashboard-textarea" 
                id="active-input" 
                placeholder="Enter values (one per line)"
                value={activeInput}
                onChange={(e) => setActiveInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="sessions-out-input" className="input-label">Sessions Out (text for all drops)</label>
              <textarea 
                className="dashboard-textarea" 
                id="sessions-out-input" 
                placeholder="Enter text for sessions out"
                value={sessionsOutInput}
                onChange={(e) => setSessionsOutInput(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-buttons">
            <button id="generate-btn" className="btn-generate" onClick={generateTableAndChart}>
              Generate Table & Chart
            </button>
            <button id="clear-btn" className="btn-clear" onClick={clearData}>
              Clear
            </button>
            <button id="export-btn" className="btn-export" onClick={exportAsHTML}>
              Export as HTML
            </button>
            <button 
              id="telegram-btn" 
              className="btn-telegram" 
              onClick={sendToTelegram}
              disabled={isSending}
              style={{
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--border-radius)',
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.6 : 1,
                fontSize: '11.2px',
                fontWeight: '600',
                transition: 'var(--transition)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isSending ? `Sending via ${selectedCMH.toUpperCase()}...` : `Send via ${selectedCMH.toUpperCase()}`}
            </button>
          </div>
        </div>

        <div className="results-row">
          <div className="dashboard-chart-container" style={{ flex: 2 }}>
            <div className="dashboard-chart-header">
              <h3 className="dashboard-chart-title">Consumption Overview</h3>
              <div className="dashboard-stats-panel">
                <div className="dashboard-stat-item">
                  <span>Total Consumption: </span>
                  <span className="dashboard-stat-value" id="total-consumption">
                    {totals.seeds}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Active: </span>
                  <span className="dashboard-stat-value" id="total-active">
                    {totals.active}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Blocked: </span>
                  <span className="dashboard-stat-value" id="total-blocked">
                    {totals.blocked}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas id="consumption-chart" ref={chartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="dashboard-table-container">
          <h3 className="dashboard-chart-title">Detailed Data</h3>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Drop N°</th>
                  <th>CONSOMMATION SEEDS (ACTIVE+BLOCKED)</th>
                  <th>Nbr BOITES ACTIVE/DROP</th>
                  <th>Nbr BOITES BLOCKED</th>
                  <th>SESSIONS OUT</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {tableData.map(row => (
                  <tr key={row.dropNumber}>
                    <td>Drop N° {row.dropNumber}</td>
                    <td>{row.seeds}</td>
                    <td>{row.active}</td>
                    <td>{row.blocked}</td>
                    <td>{sessionsOutInput}</td>
                  </tr>
                ))}
                {tableData.length > 0 && (
                  <tr className="totals-row">
                    <td colSpan="2">TOTAL CONSOMMATION: {totals.seeds}</td>
                    <td>TOTAL SEEDS ACTIVE: {totals.active}</td>
                    <td>TOTAL SEEDS BLOCKED: {totals.blocked}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsumptionReport;