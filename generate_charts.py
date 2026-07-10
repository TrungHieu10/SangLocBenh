import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Đọc kết quả từ file JSON
try:
    with open('performance_results.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    print("❌ Không tìm thấy file 'performance_results.json'. Hãy chạy performance_test.py trước!")
    exit()

seq_tests = data.get("sequential_tests", [])
conc_tests = data.get("concurrent_tests", [])

# Thiết lập style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = 'sans-serif'

# =====================================================================
# Biểu đồ 1: Average Response Time (Bar Chart)
# =====================================================================
plt.figure(figsize=(10, 6))
names = [t['name'] for t in seq_tests if t['avg'] > 0]
avgs = [t['avg'] for t in seq_tests if t['avg'] > 0]

colors = ['#4C72B0' if avg < 1000 else '#C44E52' for avg in avgs]
bars = plt.barh(names, avgs, color=colors)

plt.title('Average Response Time per API Endpoint', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Response Time (ms)', fontsize=12)
plt.xlim(0, max(avgs) * 1.2 if avgs else 100)

for bar in bars:
    width = bar.get_width()
    plt.text(width + (max(avgs)*0.02), bar.get_y() + bar.get_height()/2, 
             f'{width:.2f} ms', ha='left', va='center', fontweight='bold')

plt.tight_layout()
plt.savefig('Chart_Avg_Response.png', dpi=300)
print("✅ Đã lưu: Chart_Avg_Response.png")

# =====================================================================
# Biểu đồ 2: Latency Distribution (Violin Plot / Box Plot)
# =====================================================================
plt.figure(figsize=(10, 6))
dist_data = []
dist_labels = []

for t in seq_tests:
    if 'raw_times' in t and len(t['raw_times']) > 0:
        dist_data.append(t['raw_times'])
        # Tên viết tắt cho gọn
        name = "Login" if "Login" in t['name'] else "AI Prediction" if "AI Prediction" in t['name'] else "Feature Imp" if "Feature" in t['name'] else "Health"
        dist_labels.append(name)

if dist_data:
    sns.violinplot(data=dist_data, palette="Set2", inner="quartile")
    plt.xticks(range(len(dist_labels)), dist_labels)
    plt.title('Latency Distribution (Spread of Response Times)', fontsize=14, fontweight='bold', pad=15)
    plt.ylabel('Response Time (ms)', fontsize=12)
    plt.tight_layout()
    plt.savefig('Chart_Latency_Distribution.png', dpi=300)
    print("✅ Đã lưu: Chart_Latency_Distribution.png")

# =====================================================================
# Biểu đồ 3: Concurrent Users vs Response Time
# =====================================================================
plt.figure(figsize=(8, 5))
# Lấy AI Prediction sequential (coi như 1 user)
ai_seq = next((t for t in seq_tests if "AI Prediction" in t['name']), None)

users = []
times = []

if ai_seq and 'avg' in ai_seq:
    users.append(1)
    times.append(ai_seq['avg'])

if conc_tests:
    for ct in conc_tests:
        users.append(ct['concurrent'])
        times.append(ct['avg'])

if len(users) >= 1:
    plt.plot(users, times, marker='o', linestyle='-', linewidth=2, markersize=8, color='#D55E00')
    plt.fill_between(users, 0, times, alpha=0.1, color='#D55E00')
    plt.title('Concurrent Users vs AI Response Time', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Number of Concurrent Users', fontsize=12)
    plt.ylabel('Average Response Time (ms)', fontsize=12)
    plt.xticks(users)
    plt.grid(True, linestyle='--', alpha=0.7)
    
    for i, txt in enumerate(times):
        plt.annotate(f'{txt:.0f}ms', (users[i], times[i]), textcoords="offset points", xytext=(0,10), ha='center')

    plt.tight_layout()
    plt.savefig('Chart_Concurrent_Users.png', dpi=300)
    print("✅ Đã lưu: Chart_Concurrent_Users.png")

print("🎉 Hoàn tất! Bạn có thể chèn các file .png vào báo cáo.")
