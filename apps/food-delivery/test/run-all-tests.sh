echo "🧪 RUNNING COMPLETE LOAD TEST SUITE"
echo "===================================="
echo ""

TARGET_URL="${1:-http://localhost}"
echo "Target: $TARGET_URL"
echo ""

# Create results directory
mkdir -p results

# Test 1: Baseline
echo "📊 Test 1/8: Baseline Test (2 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/01-baseline.yml \
  --output results/01-baseline.json
echo "✅ Completed"
echo ""

# Test 2: Lunch Rush
echo "🔥 Test 2/8: Lunch Rush Test (3 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/02-lunch-rush.yml \
  --output results/02-lunch-rush.json
echo "✅ Completed"
echo ""

# Test 3: Stress Test
echo "💪 Test 3/8: Stress Test (5 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/03-stress-test.yml \
  --output results/03-stress.json
echo "✅ Completed"
echo ""

# Test 4: Endurance (Optional - takes 30 min)
read -p "Run Endurance Test (30 min)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏱️  Test 4/8: Endurance Test (30 min)..."
    TARGET_URL=$TARGET_URL artillery run load-tests/04-endurance.yml \
      --output results/04-endurance.json
    echo "✅ Completed"
else
    echo "⏭️  Skipped Endurance Test"
fi
echo ""

# Test 5: Cache Test
echo "💾 Test 5/8: Cache Test (3 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/05-cache-test.yml \
  --output results/05-cache.json
echo "✅ Completed"
echo ""

# Test 6: Order Flow
echo "📝 Test 6/8: Order Flow Test (2 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/06-order-flow.yml \
  --output results/06-order-flow.json
echo "✅ Completed"
echo ""

# Test 7: Spike Test
echo "🚨 Test 7/8: Spike Test (2 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/07-spike-test.yml \
  --output results/07-spike.json
echo "✅ Completed"
echo ""

# Test 8: Geographic Test
echo "🌍 Test 8/8: Geographic Test (2 min)..."
TARGET_URL=$TARGET_URL artillery run load-tests/08-geographic-test.yml \
  --output results/08-geographic.json
echo "✅ Completed"
echo ""

# Generate HTML reports
echo "📈 Generating HTML reports..."
for file in results/*.json; do
    artillery report "$file" --output "${file%.json}.html"
done

echo ""
echo "✅ ALL TESTS COMPLETED!"
echo ""
echo "📊 Results saved in: results/"
echo "📈 HTML reports: results/*.html"
echo ""
echo "Next: Run analysis script to compare results"
