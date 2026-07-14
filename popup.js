// 用于在内存中暂存截图数据的数组
let screenshotsData = [];

// ==========================================
// 第一阶段：控制页面点击并截图
// ==========================================
document.getElementById('startBtn').addEventListener('click', async () => {
    const startBtn = document.getElementById('startBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');
    
    startBtn.disabled = true;
    downloadBtn.style.display = 'none';
    screenshotsData = []; // 清空上次记录
    
    // 获取当前活动标签页
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    statusDiv.innerText = "正在分析页面单号...";

    // 1. 注入脚本：获取网页上有多少个单号 Tab
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            // 根据您提供的 HTML，精准抓取所有单号的 a 标签
            const tabs = document.querySelectorAll('.ui-tabs-nav a.ui-tabs-anchor');
            return Array.from(tabs).map(a => ({
                id: a.id,
                awb: a.querySelector('.title-label')?.innerText.trim() || '未知单号'
            }));
        }
    });

    const tabsInfo = results[0]?.result;
    
    if (!tabsInfo || tabsInfo.length === 0) {
        statusDiv.innerText = "❌ 未找到单号选项卡，请确保页面已加载结果。";
        startBtn.disabled = false;
        return;
    }

    // 2. 开始循环遍历每个单号并截图
    for (let i = 0; i < tabsInfo.length; i++) {
        const currentTab = tabsInfo[i];
        statusDiv.innerText = `正在截取 (${i + 1}/${tabsInfo.length}): ${currentTab.awb}...`;

        // 让网页执行：点击对应的 Tab 并将滚动条对齐到最佳位置
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (tabId) => {
                const targetElement = document.getElementById(tabId);
                if (targetElement) {
                    targetElement.click(); // 触发点击切换单号
                    // 隐藏顶部可能遮挡视线的固定 Header（如果有）
                    const header = document.querySelector('header');
                    if(header) header.style.display = 'none';
                    
                    // 将追踪容器滚动到屏幕最顶端，保证内容最大化显示
                    const container = document.getElementById('tracking-container');
                    if (container) {
                        container.scrollIntoView({ behavior: 'instant', block: 'start' });
                    } else {
                        window.scrollTo(0, 0);
                    }
                }
            },
            args: [currentTab.id]
        });

        // 核心：等待网页动画渲染和数据加载
        // 500毫秒是一个比较稳妥的等待时间，确保 Tab 切换的动画已经完成
        await new Promise(resolve => setTimeout(resolve, 500));

        // 调用 Chrome 原生 API 截取当前可见区域
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        
        // 将图片数据和对应的运单号保存起来
        screenshotsData.push({
            awb: currentTab.awb,
            imageUri: dataUrl
        });
    }

    // 恢复页面原本的样式 (如果有隐藏的 header)
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const header = document.querySelector('header');
            if(header) header.style.display = '';
        }
    });

    statusDiv.innerText = `✅ 成功截取 ${screenshotsData.length} 张图片！请点击下方导出。`;
    startBtn.disabled = false;
    startBtn.innerText = "重新截图";
    downloadBtn.style.display = 'block'; // 显示导出按钮
});

// ==========================================
// 第二阶段：按指定的文件夹结构导出图片
// ==========================================
document.getElementById('downloadBtn').addEventListener('click', () => {
    const mainFolder = document.getElementById('mainFolder').value.trim() || 'AAT_截图';
    const chkRCS = document.getElementById('chkRCS').checked;
    const chkDEP = document.getElementById('chkDEP').checked;
    const statusDiv = document.getElementById('status');

    if (!chkRCS && !chkDEP) {
        alert("请至少勾选一个分类目录（入航司仓 或 已起飞）！");
        return;
    }

    if (screenshotsData.length === 0) {
        alert("没有可导出的截图数据，请先执行截图！");
        return;
    }

    let downloadCount = 0;

    // 遍历暂存的截图数据
    screenshotsData.forEach(shot => {
        // 核心技巧：Chrome API 允许在 filename 中带有斜杠 "/"
        // 如果用户的下载设置允许，Chrome 会自动在系统的“下载(Downloads)”目录中建立对应的文件夹结构
        
        if (chkRCS) {
            chrome.downloads.download({
                url: shot.imageUri,
                filename: `${mainFolder}/2-入航司仓/${shot.awb}.png`,
                saveAs: false // 强制直接下载，不弹窗
            });
            downloadCount++;
        }
        
        if (chkDEP) {
            chrome.downloads.download({
                url: shot.imageUri,
                filename: `${mainFolder}/3-已起飞/${shot.awb}.png`,
                saveAs: false // 强制直接下载，不弹窗
            });
            downloadCount++;
        }
    });

    statusDiv.innerText = `🎉 导出指令已发送！共生成 ${downloadCount} 个文件，请前往电脑“下载”文件夹查看。`;
});