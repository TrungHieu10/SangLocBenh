"""
=================================================================
PERFORMANCE TESTING - Medical AI System
Kiểm thử hiệu năng hệ thống Medical AI
=================================================================
Cách chạy:
  1. Đảm bảo hệ thống đã chạy (docker-compose up hoặc chạy thủ công)
  2. pip install requests
  3. python performance_test.py

⚠️  AN TOÀN: Script này KHÔNG ghi thêm dữ liệu vào Database.
   - /predict (Python): Chỉ tính toán AI, trả kết quả, KHÔNG lưu DB.
   - /auth/login (.NET): Tạo refresh token → giới hạn chỉ 1 lần để lấy JWT.
   - Các test còn lại đều là GET (chỉ đọc).
=================================================================
"""

import requests
import time
import statistics
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ===================== CẤU HÌNH URL DEPLOY =====================
# SỬA URL Ở ĐÂY NẾU BẠN ĐÃ DEPLOY LÊN SERVER
DOTNET_BASE = "https://68.183.225.94/api" 
PYTHON_BASE = "http://68.183.225.94:8000" # Xem lưu ý bên dưới!

# (Nếu test dưới local thì dùng localhost)
# DOTNET_BASE = "http://localhost:5182/api"
# PYTHON_BASE = "http://localhost:8000"


# Số lần lặp cho mỗi test
NUM_REQUESTS = 20
# Số request đồng thời cho Concurrent Test
CONCURRENT_USERS = 10

# ===================== DỮ LIỆU MẪU =====================
SAMPLE_LOGIN = {
    "identifier": "Nghiaklv205@gmail.com",
    "password": "Hieuthuhai910"
}

SAMPLE_PATIENT_METRICS = {
    "Age": 55,
    "Gender": 1,
    "Height_cm": 170,
    "Weight_kg": 80,
    "SystolicBP": 145,
    "DiastolicBP": 92,
    "BloodGlucose": 140,
    "HbA1c": 6.5,
    "Cholesterol_Total": 220,
    "SerumCreatinine": 1.1,
    "BloodUrea": 25,
    "Hemoglobin": 13.5,
    "ALT_SGPT": 35,
    "AST_SGOT": 40,
    "TotalBilirubin": 0.8,
    "DirectBilirubin": 0.2,
    "Alkaline_Phosphotase": 85,
    "Total_Protiens": 6.8,
    "Albumin_Blood": 3.5,
    "A_G_Ratio": 1.1,
    "SmokingStatus": 2,
    "AlcoholConsumption": 0,
    "PhysicalActivity": 0,
    "Hypertension_History": 1,
    "HeartDisease_History": 0
}

# ===================== HÀM ĐO HIỆU NĂNG =====================
def measure_request(method, url, headers=None, json_data=None, timeout=30):
    """Gửi 1 request và đo thời gian phản hồi (ms)"""
    try:
        start = time.perf_counter()
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=timeout, verify=False)
        else:
            resp = requests.post(url, headers=headers, json=json_data, timeout=timeout, verify=False)
        elapsed = (time.perf_counter() - start) * 1000  # ms
        # 401 cũng tính là server phản hồi (đo tốc độ xác thực)
        is_ok = resp.status_code not in [0, 500, 502, 503, 504]
        return {
            "status": resp.status_code,
            "time_ms": round(elapsed, 2),
            "success": is_ok
        }
    except Exception as e:
        return {"status": 0, "time_ms": 0, "success": False, "error": str(e)}


def run_test(name, method, url, headers=None, json_data=None, n=NUM_REQUESTS):
    """Chạy n lần request và tính thống kê"""
    print(f"\n{'='*60}")
    print(f"  📊 TEST: {name}")
    print(f"  URL: {url}")
    print(f"  Số lần lặp: {n}")
    print(f"{'='*60}")

    times = []
    success_count = 0

    for i in range(n):
        result = measure_request(method, url, headers, json_data)
        if result["success"]:
            times.append(result["time_ms"])
            success_count += 1
            print(f"  [{i+1:3d}/{n}] ✅ {result['time_ms']:8.2f} ms  (HTTP {result['status']})")
        else:
            print(f"  [{i+1:3d}/{n}] ❌ FAILED  (HTTP {result['status']}) {result.get('error','')}")

    if not times:
        return {"name": name, "avg": 0, "min": 0, "max": 0, "p95": 0, "success_rate": 0}

    times_sorted = sorted(times)
    p95_idx = int(len(times_sorted) * 0.95)

    stats = {
        "name": name,
        "avg": round(statistics.mean(times), 2),
        "min": round(min(times), 2),
        "max": round(max(times), 2),
        "median": round(statistics.median(times), 2),
        "p95": round(times_sorted[min(p95_idx, len(times_sorted)-1)], 2),
        "std": round(statistics.stdev(times), 2) if len(times) > 1 else 0,
        "success_rate": round(success_count / n * 100, 1),
        "total_requests": n,
        "raw_times": times # Lưu lại mảng thời gian để vẽ biểu đồ
    }

    print(f"\n  📈 KẾT QUẢ:")
    print(f"     Trung bình (Avg)  : {stats['avg']:>10.2f} ms")
    print(f"     Nhanh nhất (Min)  : {stats['min']:>10.2f} ms")
    print(f"     Chậm nhất (Max)   : {stats['max']:>10.2f} ms")
    print(f"     Trung vị (Median) : {stats['median']:>10.2f} ms")
    print(f"     P95 Latency       : {stats['p95']:>10.2f} ms")
    print(f"     Độ lệch chuẩn    : {stats['std']:>10.2f} ms")
    print(f"     Tỷ lệ thành công : {stats['success_rate']:>9.1f} %")

    return stats


def run_concurrent_test(name, method, url, headers=None, json_data=None, 
                        concurrent=CONCURRENT_USERS, total=CONCURRENT_USERS*3):
    """Test đồng thời: nhiều user gọi API cùng lúc"""
    print(f"\n{'='*60}")
    print(f"  🔥 CONCURRENT TEST: {name}")
    print(f"  URL: {url}")
    print(f"  Đồng thời: {concurrent} users  |  Tổng: {total} requests")
    print(f"{'='*60}")

    times = []
    errors = 0

    start_all = time.perf_counter()
    with ThreadPoolExecutor(max_workers=concurrent) as executor:
        futures = [
            executor.submit(measure_request, method, url, headers, json_data)
            for _ in range(total)
        ]
        for i, future in enumerate(as_completed(futures)):
            result = future.result()
            if result["success"]:
                times.append(result["time_ms"])
            else:
                errors += 1
    total_time = (time.perf_counter() - start_all) * 1000

    if not times:
        print("  ❌ Tất cả request đều thất bại!")
        return None

    times_sorted = sorted(times)
    p95_idx = int(len(times_sorted) * 0.95)
    throughput = len(times) / (total_time / 1000)  # req/s

    print(f"\n  📈 KẾT QUẢ CONCURRENT:")
    print(f"     Tổng thời gian    : {total_time:>10.2f} ms")
    print(f"     Throughput        : {throughput:>10.2f} req/s")
    print(f"     Avg Latency       : {statistics.mean(times):>10.2f} ms")
    print(f"     P95 Latency       : {times_sorted[min(p95_idx, len(times_sorted)-1)]:>10.2f} ms")
    print(f"     Thành công        : {len(times):>10d} / {total}")
    print(f"     Thất bại          : {errors:>10d}")

    return {
        "name": name,
        "concurrent": concurrent,
        "throughput": round(throughput, 2),
        "avg": round(statistics.mean(times), 2),
        "p95": round(times_sorted[min(p95_idx, len(times_sorted)-1)], 2),
        "success": len(times),
        "errors": errors,
        "raw_times": times # Lưu lại mảng thời gian để vẽ biểu đồ
    }


# ===================== CHẠY TESTS =====================
def main():
    print("\n" + "🏥" * 30)
    print("  MEDICAL AI - PERFORMANCE TESTING REPORT")
    print("  Thời gian: " + time.strftime("%Y-%m-%d %H:%M:%S"))
    print("🏥" * 30)

    all_results = []
    concurrent_results = []

    # ─────────────────────────────────────────────
    # TEST 1: Health Check - Python FastAPI
    # (GET endpoint → chỉ đọc, KHÔNG ghi DB)
    # ─────────────────────────────────────────────
    r = run_test(
        "Health Check (Python FastAPI)",
        "GET", f"{PYTHON_BASE}/api/feature-importance/diabetes",
        n=NUM_REQUESTS
    )
    all_results.append(r)

    # ─────────────────────────────────────────────
    # TEST 2: Đăng nhập (Login) - .NET API
    # ⚠️ Login tạo RefreshToken trong DB → chỉ test 5 lần
    # ─────────────────────────────────────────────
    r = run_test(
        "Đăng nhập (Login API)",
        "POST", f"{DOTNET_BASE}/auth/login",
        json_data=SAMPLE_LOGIN,
        n=5  # Giới hạn 5 lần vì mỗi lần tạo 1 RefreshToken
    )
    all_results.append(r)

    # Lấy token cho các test tiếp theo (dùng lại từ lần login cuối)
    token = None
    try:
        resp = requests.post(f"{DOTNET_BASE}/auth/login", json=SAMPLE_LOGIN, timeout=10)
        if resp.status_code == 200:
            token = resp.json().get("token")
            print(f"\n  🔑 Đã lấy JWT Token thành công!")
    except:
        print(f"\n  ⚠️  Không lấy được token, bỏ qua các test cần xác thực")

    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

    # ─────────────────────────────────────────────
    # TEST 3: AI Prediction (trọng tâm!)
    # POST /api/predict/all → Python tính toán AI rồi TRẢ VỀ kết quả
    # ✅ AN TOÀN: Endpoint này KHÔNG lưu gì vào SQL Server
    # ─────────────────────────────────────────────
    r = run_test(
        "🧠 AI Prediction (5 bệnh + SHAP + Neo4j)",
        "POST", f"{PYTHON_BASE}/api/predict/all",
        json_data=SAMPLE_PATIENT_METRICS,
        n=NUM_REQUESTS
    )
    all_results.append(r)

    # ─────────────────────────────────────────────
    # TEST 4: Feature Importance (GET - chỉ đọc)
    # ✅ AN TOÀN: Chỉ trả về feature importance từ model trong RAM
    # ─────────────────────────────────────────────
    r = run_test(
        "Feature Importance (GET)",
        "GET", f"{PYTHON_BASE}/api/feature-importance/heart",
        n=NUM_REQUESTS
    )
    all_results.append(r)

    # ─────────────────────────────────────────────
    # TEST 5: Concurrent - AI Prediction
    # ✅ AN TOÀN: /predict không ghi DB
    # ─────────────────────────────────────────────
    cr = run_concurrent_test(
        "🔥 AI Prediction (Concurrent)",
        "POST", f"{PYTHON_BASE}/api/predict/all",
        json_data=SAMPLE_PATIENT_METRICS,
        concurrent=CONCURRENT_USERS,
        total=CONCURRENT_USERS * 3
    )
    if cr:
        concurrent_results.append(cr)

    # ─────────────────────────────────────────────
    # TỔNG HỢP KẾT QUẢ
    # ─────────────────────────────────────────────
    print("\n\n" + "=" * 80)
    print("  📋 BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ HIỆU NĂNG")
    print("=" * 80)

    # Header
    print(f"\n  {'API Endpoint':<45} {'Avg(ms)':>8} {'Min(ms)':>8} {'Max(ms)':>8} {'P95(ms)':>8} {'Success':>8}")
    print("  " + "─" * 85)

    for r in all_results:
        if r["avg"] > 0:
            print(f"  {r['name']:<45} {r['avg']:>8.2f} {r['min']:>8.2f} {r['max']:>8.2f} {r['p95']:>8.2f} {r['success_rate']:>7.1f}%")

    if concurrent_results:
        print(f"\n\n  {'Concurrent Test':<45} {'Users':>8} {'Throughput':>12} {'Avg(ms)':>8} {'P95(ms)':>8} {'Errors':>8}")
        print("  " + "─" * 85)
        for cr in concurrent_results:
            print(f"  {cr['name']:<45} {cr['concurrent']:>8} {cr['throughput']:>10.2f}/s {cr['avg']:>8.2f} {cr['p95']:>8.2f} {cr['errors']:>8}")

    # Đánh giá tổng thể
    print(f"\n\n  {'='*60}")
    print(f"  📊 ĐÁNH GIÁ TỔNG THỂ")
    print(f"  {'='*60}")

    ai_result = next((r for r in all_results if "AI Prediction" in r["name"]), None)
    if ai_result and ai_result["avg"] > 0:
        avg = ai_result["avg"]
        if avg < 500:
            grade = "🟢 XUẤT SẮC (< 500ms)"
        elif avg < 1000:
            grade = "🟡 TỐT (< 1 giây)"
        elif avg < 3000:
            grade = "🟠 CHẤP NHẬN ĐƯỢC (< 3 giây)"
        else:
            grade = "🔴 CẦN TỐI ƯU (> 3 giây)"

        print(f"  Thời gian suy luận AI trung bình: {avg:.2f} ms → {grade}")
        print(f"  (Bao gồm: Load 5 models + Scale + XGBoost predict + SHAP + Neo4j query)")

    print(f"\n  Hoàn thành lúc: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  {'='*60}\n")

    # Lưu kết quả ra file JSON
    output = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "sequential_tests": all_results,
        "concurrent_tests": concurrent_results
    }
    with open("performance_results.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("  💾 Đã lưu kết quả vào: performance_results.json\n")


if __name__ == "__main__":
    main()
