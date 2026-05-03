#!/bin/bash

# 测试问卷后端API

API_BASE_URL="http://47.114.85.2:3001/api"

echo "================================="
echo "问卷后端API测试"
echo "================================="
echo ""

# 测试1: 健康检查
echo "测试1: 健康检查"
echo "GET ${API_BASE_URL}/health"
curl -s "${API_BASE_URL}/health" | python3 -m json.tool
echo ""

# 测试2: 保存问卷数据
echo "测试2: 保存问卷数据"
echo "POST ${API_BASE_URL}/questionnaire/save"

TEST_DATA='{
  "participantId": "TEST_'$(date +%s)'",
  "group": 1,
  "preTest": {"q1": 5, "q2": 4},
  "attentionTest": {"q1": 3, "q2": 4},
  "mainQuestionnaire": {"q1": 7, "q2": 8},
  "demographics": {"gender": "male", "age": 30},
  "contactInfo": "test@example.com",
  "startTime": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "completed": false
}'

echo "测试数据:"
echo "$TEST_DATA" | python3 -m json.tool
echo ""

SAVE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/questionnaire/save" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "响应:"
echo "$SAVE_RESPONSE" | python3 -m json.tool
echo ""

# 提取participantId用于后续测试
PARTICIPANT_ID=$(echo "$SAVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('participantId', ''))" 2>/dev/null)

if [ -n "$PARTICIPANT_ID" ]; then
    echo "✓ 测试数据已保存，参与者ID: $PARTICIPANT_ID"
    echo ""

    # 测试3: 获取问卷数据
    echo "测试3: 获取问卷数据"
    echo "GET ${API_BASE_URL}/questionnaire/${PARTICIPANT_ID}"
    curl -s "${API_BASE_URL}/questionnaire/${PARTICIPANT_ID}" | python3 -m json.tool
    echo ""

    # 测试4: 更新问卷数据
    echo "测试4: 更新问卷数据"
    echo "POST ${API_BASE_URL}/questionnaire/save"

    UPDATE_DATA='{
      "participantId": "'$PARTICIPANT_ID'",
      "group": 1,
      "preTest": {"q1": 5, "q2": 4},
      "attentionTest": {"q1": 3, "q2": 4},
      "mainQuestionnaire": {"q1": 7, "q2": 8},
      "demographics": {"gender": "male", "age": 30},
      "contactInfo": "test@example.com",
      "startTime": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
      "completed": true
    }'

    echo "更新数据:"
    echo "$UPDATE_DATA" | python3 -m json.tool
    echo ""

    UPDATE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/questionnaire/save" \
      -H "Content-Type: application/json" \
      -d "$UPDATE_DATA")

    echo "响应:"
    echo "$UPDATE_RESPONSE" | python3 -m json.tool
    echo ""

    # 测试5: 获取统计信息
    echo "测试5: 获取统计信息"
    echo "GET ${API_BASE_URL}/admin/stats"
    curl -s "${API_BASE_URL}/admin/stats" | python3 -m json.tool
    echo ""

    # 测试6: 获取问卷列表
    echo "测试6: 获取问卷列表"
    echo "GET ${API_BASE_URL}/admin/questionnaires?completed=true&limit=10"
    curl -s "${API_BASE_URL}/admin/questionnaires?completed=true&limit=10" | python3 -m json.tool
    echo ""

    # 测试7: 导出数据
    echo "测试7: 导出数据"
    echo "GET ${API_BASE_URL}/admin/export?format=json"
    curl -s "${API_BASE_URL}/admin/export?format=json" | python3 -m json.tool | head -50
    echo ""
    echo "... (数据已截断)"
    echo ""

    # 测试8: 删除测试数据
    echo "测试8: 删除测试数据"
    echo "DELETE ${API_BASE_URL}/admin/questionnaire/${PARTICIPANT_ID}"
    DELETE_RESPONSE=$(curl -s -X DELETE "${API_BASE_URL}/admin/questionnaire/${PARTICIPANT_ID}")
    echo "$DELETE_RESPONSE" | python3 -m json.tool
    echo ""
else
    echo "✗ 保存测试数据失败，跳过后续测试"
fi

echo "================================="
echo "测试完成"
echo "================================="
