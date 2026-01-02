"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";

type Situation = 'alive' | 'deceased' | null;
type AliveDetailType = 'adult' | 'minor' | 'guardian_adult' | null;
type AccountHolder = 'self' | 'family' | 'other' | null;
type RefundAmount = 'under300k' | 'over300k' | null;
type CanExpress = 'yes' | 'no' | null;
type DeceasedRelationship = 'child' | 'spouse' | 'parent' | 'sibling' | 'grandchild' | 'grandparent' | 'fourth_degree' | 'heir_guardian' | null;
type SiblingStatus = 'all_alive' | 'some_deceased' | 'only_child' | null;
type ChildStatus = 'one_child' | 'multiple_alive' | 'some_deceased' | null;
type OtherChildrenStatus = 'none' | 'all_alive' | 'some_deceased' | null;
type SiblingsStatusType = 'only_self' | 'multiple_alive' | 'some_deceased' | null;
type ParentRelationStatus = 'both_married' | 'divorced_or_bereaved' | 'both_deceased' | null;

export default function DocumentsPage() {
  const [step, setStep] = useState<number>(1);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [situation, setSituation] = useState<Situation>(null);
  const [aliveDetailType, setAliveDetailType] = useState<AliveDetailType>(null);
  const [accountHolder, setAccountHolder] = useState<AccountHolder>(null);
  const [refundAmount, setRefundAmount] = useState<RefundAmount>(null);
  const [canExpress, setCanExpress] = useState<CanExpress>(null);
  const [deceasedRelationship, setDeceasedRelationship] = useState<DeceasedRelationship>(null);

  // 순차 검증용 state
  const [hasSpouse, setHasSpouse] = useState<boolean | null>(null);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [hasParents, setHasParents] = useState<boolean | null>(null);
  const [hasSiblings, setHasSiblings] = useState<boolean | null>(null);
  const [hasFourthDegree, setHasFourthDegree] = useState<boolean | null>(null);

  // 100만원 초과 자녀 케이스용 state
  const [siblingStatus, setSiblingStatus] = useState<SiblingStatus>(null);
  const [hasDaeseup, setHasDaeseup] = useState<boolean | null>(null);

  // 100만원 초과 배우자 케이스용 state
  const [childStatus, setChildStatus] = useState<ChildStatus>(null);

  // 100만원 초과 손자녀 케이스용 state
  const [hasParentAlive, setHasParentAlive] = useState<boolean | null>(null);
  const [hasGrandparentSpouse, setHasGrandparentSpouse] = useState<boolean | null>(null);
  const [otherChildrenStatus, setOtherChildrenStatus] = useState<OtherChildrenStatus>(null);
  const [hasOtherDaeseup, setHasOtherDaeseup] = useState<boolean | null>(null);

  // 100만원 초과 형제자매 케이스용 state
  const [hasSeniorHeirs, setHasSeniorHeirs] = useState<boolean | null>(null);
  const [siblingsStatusType, setSiblingsStatusType] = useState<SiblingsStatusType>(null);
  const [hasSiblingDaeseup, setHasSiblingDaeseup] = useState<boolean | null>(null);

  // 100만원 초과 부모 케이스용 state
  const [hasSeniorHeirsForParent, setHasSeniorHeirsForParent] = useState<boolean | null>(null);

  // 100만원 초과 조부모 케이스용 state
  const [hasSeniorHeirsForGrandparent, setHasSeniorHeirsForGrandparent] = useState<boolean | null>(null);
  const [areParentsBothDeceased, setAreParentsBothDeceased] = useState<boolean | null>(null);

  // 미성년자 케이스용 state
  const [parentRelationStatus, setParentRelationStatus] = useState<ParentRelationStatus>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const captureRef = useRef<HTMLDivElement>(null);
  const [sampleImage, setSampleImage] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Helper function to navigate to a new step while tracking history
  const navigateToStep = (newStep: number) => {
    setStepHistory([...stepHistory, step]);
    setStep(newStep);
  };

  const handleSituationSelect = (selected: Situation) => {
    setSituation(selected);
    setAnswers({ ...answers, situation: selected });

    if (selected === 'alive') {
      navigateToStep(2); // 생존인 경우 상세 상황 선택으로
    } else if (selected === 'deceased') {
      navigateToStep(9); // 사망인 경우 환급금 금액 질문으로
    }
  };

  const handleAliveDetailSelect = (selected: AliveDetailType) => {
    setAliveDetailType(selected);
    setAnswers({ ...answers, aliveDetailType: selected });

    if (selected === 'adult') {
      navigateToStep(3); // 일반(성인) 경우 기존 예금주 질문으로
    } else if (selected === 'minor') {
      navigateToStep(42); // 미성년자인 경우 신청인 확인으로
    } else if (selected === 'guardian_adult') {
      navigateToStep(48); // 성년후견인 있음 경우 결과로
    }
  };

  const handleAccountHolderSelect = (selected: AccountHolder) => {
    setAccountHolder(selected);
    setAnswers({ ...answers, accountHolder: selected });

    if (selected === 'self') {
      navigateToStep(4); // 본인인 경우 최종 결과로
    } else if (selected === 'family') {
      navigateToStep(5); // 가족인 경우 환급금 금액 질문으로
    } else if (selected === 'other') {
      navigateToStep(9); // 타인인 경우 최종 결과로
    }
  };

  const handleDeceasedRelationshipSelect = (selected: DeceasedRelationship) => {
    setDeceasedRelationship(selected);
    setAnswers({ ...answers, deceasedRelationship: selected });

    // 100만원 이하이고 자녀 또는 배우자 선택 시 바로 결과로
    if (refundAmount === 'under300k' && (selected === 'child' || selected === 'spouse')) {
      navigateToStep(18); // 바로 결과로
    }
    // 100만원 초과이고 자녀 선택 시 자녀 전용 플로우로
    else if (refundAmount === 'over300k' && selected === 'child') {
      navigateToStep(20); // 자녀 케이스 STEP 1: 배우자 확인
    }
    // 100만원 초과이고 배우자 선택 시 배우자 전용 플로우로
    else if (refundAmount === 'over300k' && selected === 'spouse') {
      navigateToStep(24); // 배우자 케이스 STEP 1: 자녀/손자녀 확인
    }
    // 100만원 초과이고 손자녀 선택 시 지사 방문 안내로
    else if (refundAmount === 'over300k' && selected === 'grandchild') {
      navigateToStep(41); // 손자녀 케이스: 지사 방문 안내
    }
    // 100만원 초과이고 형제자매 선택 시 형제자매 전용 플로우로
    else if (refundAmount === 'over300k' && selected === 'sibling') {
      navigateToStep(35); // 형제자매 케이스 STEP 1: 선순위 상속인 확인
    }
    // 100만원 초과이고 4촌 이내 친척 선택 시 지사 방문 안내로
    else if (refundAmount === 'over300k' && selected === 'fourth_degree') {
      navigateToStep(40); // 4촌 친척 케이스: 지사 방문 안내
    }
    // 상속인의 후견인인 경우 (100만원 이하, 초과 모두) 결과로
    else if (selected === 'heir_guardian') {
      navigateToStep(49); // 상속인의 후견인 결과로
    }
    // 100만원 초과 부모 케이스는 선순위 상속인 확인부터
    else if (refundAmount === 'over300k' && selected === 'parent') {
      navigateToStep(60); // 부모 케이스: 선순위 상속인(자녀/손자녀) 확인
    }
    // 100만원 초과 조부모 케이스는 선순위 상속인 확인부터
    else if (refundAmount === 'over300k' && selected === 'grandparent') {
      navigateToStep(65); // 조부모 케이스: 1순위 상속인(자녀/손자녀) 확인
    }
    // 100만원 이하 부모, 손자녀, 기타 관계인 경우 배우자 확인으로
    else {
      navigateToStep(11); // STEP 1: 배우자 확인으로
    }
  };

  // STEP 1: 배우자 확인
  const handleSpouseCheck = (hasSpouseValue: boolean) => {
    setHasSpouse(hasSpouseValue);
    setAnswers({ ...answers, hasSpouse: hasSpouseValue });

    // 100만원 이하이고 부모/손자녀인 경우
    if (refundAmount === 'under300k' && (deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild')) {
      if (hasSpouseValue) {
        navigateToStep(19); // 지급불가 결과로
      } else {
        navigateToStep(12); // 자녀 확인으로
      }
    }
    // 100만원 초과인 경우 기존 로직대로
    else {
      navigateToStep(12); // STEP 2: 1순위 확인으로
    }
  };

  // STEP 2: 1순위 (자녀/손자녀) 확인
  const handleChildrenCheck = (hasChildrenValue: boolean) => {
    setHasChildren(hasChildrenValue);
    setAnswers({ ...answers, hasChildren: hasChildrenValue });

    // 100만원 이하이고 부모/손자녀인 경우
    if (refundAmount === 'under300k' && (deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild')) {
      if (hasChildrenValue) {
        navigateToStep(19); // 지급불가 결과로
      } else {
        navigateToStep(18); // 결과로
      }
    }
    // 100만원 초과인 경우 기존 로직대로
    else {
      if (hasChildrenValue) {
        navigateToStep(18); // 결과로
      } else {
        navigateToStep(13); // STEP 3: 2순위 확인으로
      }
    }
  };

  // STEP 3: 2순위 (부모/조부모) 확인
  const handleParentsCheck = (hasParentsValue: boolean) => {
    setHasParents(hasParentsValue);
    setAnswers({ ...answers, hasParents: hasParentsValue });
    if (hasParentsValue) {
      navigateToStep(18); // 결과로
    } else {
      navigateToStep(14); // STEP 4: 배우자 단독 체크
    }
  };

  // STEP 4: 배우자 단독 체크는 자동으로 처리되므로 바로 STEP 5로
  // STEP 5: 3순위 (형제자매) 확인
  const handleSiblingsCheck = (hasSiblingsValue: boolean) => {
    setHasSiblings(hasSiblingsValue);
    setAnswers({ ...answers, hasSiblings: hasSiblingsValue });
    if (hasSiblingsValue) {
      navigateToStep(18); // 결과로
    } else {
      navigateToStep(17); // STEP 6: 4촌 확인으로
    }
  };

  // STEP 6: 4촌 이내 친척 확인
  const handleFourthDegreeCheck = (hasFourthDegreeValue: boolean) => {
    setHasFourthDegree(hasFourthDegreeValue);
    setAnswers({ ...answers, hasFourthDegree: hasFourthDegreeValue });
    navigateToStep(18); // 결과로
  };

  // === 100만원 초과 자녀 케이스 핸들러 ===

  // STEP 1: 배우자 확인 (자녀 케이스)
  const handleChildCaseSpouseCheck = (hasSpouseValue: boolean) => {
    setHasSpouse(hasSpouseValue);
    setAnswers({ ...answers, hasSpouse: hasSpouseValue });
    navigateToStep(21); // STEP 2: 형제자매 상황으로
  };

  // STEP 2: 형제자매 상황
  const handleSiblingStatusSelect = (status: SiblingStatus) => {
    setSiblingStatus(status);
    setAnswers({ ...answers, siblingStatus: status });

    if (status === 'all_alive' || status === 'only_child') {
      setHasDaeseup(false); // 외동 또는 여러명 모두 생존 시 대습상속 없음
      navigateToStep(23); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(22); // STEP 3: 대습상속 확인으로
    }
  };

  // STEP 3: 대습상속 확인
  const handleDaeseupCheck = (hasDaeseupValue: boolean) => {
    setHasDaeseup(hasDaeseupValue);
    setAnswers({ ...answers, hasDaeseup: hasDaeseupValue });
    if (hasDaeseupValue) {
      navigateToStep(50); // 대습상속 있으면 지사 상담으로
    } else {
      navigateToStep(23); // 대습상속 없으면 결과로
    }
  };

  // === 100만원 초과 배우자 케이스 핸들러 ===

  // STEP 1: 자녀/손자녀 확인 (배우자 케이스)
  const handleSpouseCaseChildrenCheck = (hasChildrenValue: boolean) => {
    setHasChildren(hasChildrenValue);
    setAnswers({ ...answers, hasChildren: hasChildrenValue });

    if (hasChildrenValue) {
      navigateToStep(25); // STEP 2: 자녀 상황으로
    } else {
      navigateToStep(27); // STEP 3: 부모님 확인으로
    }
  };

  // STEP 2: 자녀 상황 (배우자 케이스)
  const handleChildStatusSelect = (status: ChildStatus) => {
    setChildStatus(status);
    setAnswers({ ...answers, childStatus: status });

    if (status === 'one_child' || status === 'multiple_alive') {
      setHasDaeseup(false); // 외동 또는 여러명 모두 생존 시 대습상속 없음
      navigateToStep(28); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(26); // STEP: 대습상속 확인으로
    }
  };

  // STEP: 대습상속 확인 (배우자 케이스)
  const handleSpouseCaseDaeseupCheck = (hasDaeseupValue: boolean) => {
    setHasDaeseup(hasDaeseupValue);
    setAnswers({ ...answers, hasDaeseup: hasDaeseupValue });
    if (hasDaeseupValue) {
      navigateToStep(50); // 대습상속 있으면 지사 상담으로
    } else {
      navigateToStep(28); // 대습상속 없으면 결과로
    }
  };

  // STEP 3: 부모님 확인 (배우자 케이스, 자녀 없을 때)
  const handleSpouseCaseParentsCheck = (hasParentsValue: boolean) => {
    setHasParents(hasParentsValue);
    setAnswers({ ...answers, hasParents: hasParentsValue });
    navigateToStep(28); // 결과로
  };

  // === 100만원 초과 손자녀 케이스 핸들러 ===

  // STEP 1: 부모 생존 확인 (손자녀 케이스)
  const handleGrandchildCaseParentCheck = (hasParentAliveValue: boolean) => {
    setHasParentAlive(hasParentAliveValue);
    setAnswers({ ...answers, hasParentAlive: hasParentAliveValue });

    if (hasParentAliveValue) {
      navigateToStep(34); // 신청 불가 결과로
    } else {
      navigateToStep(30); // STEP 2: 조부모 배우자 확인으로
    }
  };

  // STEP 2: 조부모 배우자 확인 (손자녀 케이스)
  const handleGrandparentSpouseCheck = (hasGrandparentSpouseValue: boolean) => {
    setHasGrandparentSpouse(hasGrandparentSpouseValue);
    setAnswers({ ...answers, hasGrandparentSpouse: hasGrandparentSpouseValue });
    navigateToStep(31); // STEP 3: 다른 자녀 상황으로
  };

  // STEP 3: 다른 자녀 상황 (손자녀 케이스)
  const handleOtherChildrenStatusSelect = (status: OtherChildrenStatus) => {
    setOtherChildrenStatus(status);
    setAnswers({ ...answers, otherChildrenStatus: status });

    if (status === 'none' || status === 'all_alive') {
      navigateToStep(33); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(32); // STEP 4: 추가 대습상속 확인으로
    }
  };

  // STEP 4: 추가 대습상속 확인 (손자녀 케이스)
  const handleOtherDaeseupCheck = (hasOtherDaeseupValue: boolean) => {
    setHasOtherDaeseup(hasOtherDaeseupValue);
    setAnswers({ ...answers, hasOtherDaeseup: hasOtherDaeseupValue });
    if (hasOtherDaeseupValue) {
      navigateToStep(50); // 추가 대습상속 있으면 지사 상담으로
    } else {
      navigateToStep(33); // 추가 대습상속 없으면 결과로
    }
  };

  // === 100만원 초과 형제자매 케이스 핸들러 ===

  // STEP 1: 선순위 상속인 확인 (형제자매 케이스)
  const handleSiblingCaseSeniorHeirsCheck = (hasSeniorHeirsValue: boolean) => {
    setHasSeniorHeirs(hasSeniorHeirsValue);
    setAnswers({ ...answers, hasSeniorHeirs: hasSeniorHeirsValue });

    if (hasSeniorHeirsValue) {
      navigateToStep(39); // 신청 불가 결과로
    } else {
      navigateToStep(36); // STEP 2: 형제자매 상황으로
    }
  };

  // STEP 2: 형제자매 상황 (형제자매 케이스)
  const handleSiblingsStatusTypeSelect = (status: SiblingsStatusType) => {
    setSiblingsStatusType(status);
    setAnswers({ ...answers, siblingsStatusType: status });

    if (status === 'only_self' || status === 'multiple_alive') {
      navigateToStep(38); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(37); // STEP 3: 대습상속 확인으로
    }
  };

  // STEP 3: 대습상속 확인 (형제자매 케이스)
  const handleSiblingDaeseupCheck = (hasSiblingDaeseupValue: boolean) => {
    setHasSiblingDaeseup(hasSiblingDaeseupValue);
    setAnswers({ ...answers, hasSiblingDaeseup: hasSiblingDaeseupValue });
    if (hasSiblingDaeseupValue) {
      navigateToStep(50); // 대습상속 있으면 지사 상담으로
    } else {
      navigateToStep(38); // 대습상속 없으면 결과로
    }
  };

  // === 100만원 초과 부모 케이스 핸들러 ===

  // STEP 60: 선순위 상속인(자녀/손자녀) 확인
  const handleParentCaseSeniorHeirsCheck = (hasSeniorHeirsValue: boolean) => {
    setHasSeniorHeirsForParent(hasSeniorHeirsValue);
    setAnswers({ ...answers, hasSeniorHeirsForParent: hasSeniorHeirsValue });
    if (hasSeniorHeirsValue) {
      navigateToStep(61); // 선순위 상속인 있으면 신청 불가
    } else {
      navigateToStep(62); // 선순위 상속인 없으면 배우자 확인으로
    }
  };

  // STEP 62: 배우자 확인 (부모 케이스)
  const handleParentCaseSpouseCheck = (hasSpouseValue: boolean) => {
    setHasSpouse(hasSpouseValue);
    setAnswers({ ...answers, hasSpouse: hasSpouseValue });
    navigateToStep(64); // 결과로
  };

  // === 100만원 초과 조부모 케이스 핸들러 ===

  // STEP 65: 1순위 상속인(자녀/손자녀) 확인
  const handleGrandparentCaseSeniorHeirsCheck = (hasSeniorHeirsValue: boolean) => {
    setHasSeniorHeirsForGrandparent(hasSeniorHeirsValue);
    setAnswers({ ...answers, hasSeniorHeirsForGrandparent: hasSeniorHeirsValue });
    if (hasSeniorHeirsValue) {
      navigateToStep(66); // 1순위 상속인 있으면 신청 불가
    } else {
      navigateToStep(67); // 1순위 상속인 없으면 부모 사망 확인으로
    }
  };

  // STEP 67: 부모 사망 확인
  const handleParentsDeceasedCheck = (areBothDeceasedValue: boolean) => {
    setAreParentsBothDeceased(areBothDeceasedValue);
    setAnswers({ ...answers, areParentsBothDeceased: areBothDeceasedValue });
    if (areBothDeceasedValue) {
      navigateToStep(68); // 부모 모두 사망 시 배우자 확인으로
    } else {
      navigateToStep(66); // 부모 중 한 분이라도 생존 시 신청 불가
    }
  };

  // STEP 68: 배우자 확인 (조부모 케이스)
  const handleGrandparentCaseSpouseCheck = (hasSpouseValue: boolean) => {
    setHasSpouse(hasSpouseValue);
    setAnswers({ ...answers, hasSpouse: hasSpouseValue });
    navigateToStep(69); // 결과로
  };

  // === 미성년자 케이스 핸들러 ===

  // STEP 1: 부모님 관계 확인 (미성년자 케이스)
  const handleParentRelationStatusSelect = (status: ParentRelationStatus) => {
    setParentRelationStatus(status);
    setAnswers({ ...answers, parentRelationStatus: status });

    if (status === 'both_married') {
      navigateToStep(46); // 일반 부모 대리 신청 결과로
    } else {
      // divorced_or_bereaved 또는 both_deceased
      navigateToStep(47); // 친권자/후견인 결과로
    }
  };

  const handleRefundAmountSelect = (selected: RefundAmount) => {
    setRefundAmount(selected);
    setAnswers({ ...answers, refundAmount: selected });

    // 사망 케이스
    if (situation === 'deceased') {
      navigateToStep(10); // 관계 선택으로
    }
    // 생존 케이스
    else if (situation === 'alive') {
      if (selected === 'under300k') {
        navigateToStep(6); // 30만원 이하는 바로 결과로
      } else if (selected === 'over300k') {
        navigateToStep(7); // 30만원 초과는 의사표현 가능 여부 질문으로
      }
    }
  };

  const handleCanExpressSelect = (selected: CanExpress) => {
    setCanExpress(selected);
    setAnswers({ ...answers, canExpress: selected });
    navigateToStep(8); // 최종 결과로
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(stepHistory.slice(0, -1));
      setStep(previousStep);
    }
  };

  // 저장하기 (다운로드)
  const handleSave = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#f3f4f6',
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // 1. 모든 스타일시트에서 lab/oklch 컬러 제거
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet) => {
              try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach((rule: any) => {
                  if (rule.style) {
                    const style = rule.style;
                    for (let i = 0; i < style.length; i++) {
                      const prop = style[i];
                      const value = style.getPropertyValue(prop);
                      if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(') || value.includes('oklab('))) {
                        // 기본 컬러로 교체
                        const fallbackColors: { [key: string]: string } = {
                          'color': '#000000',
                          'background-color': 'transparent',
                          'border-color': '#000000',
                          'fill': 'currentColor',
                          'stroke': 'currentColor'
                        };
                        style.setProperty(prop, fallbackColors[prop] || 'transparent', 'important');
                      }
                    }
                  }
                });
              } catch (e) {
                // CORS나 접근 권한 문제는 무시
                console.warn('Cannot access stylesheet:', e);
              }
            });
          } catch (e) {
            console.warn('Stylesheet processing error:', e);
          }

          // 2. 모든 요소의 인라인 스타일 강제 변환
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((element) => {
            try {
              const computedStyle = window.getComputedStyle(element);
              const htmlElement = element as HTMLElement;

              // 주요 컬러 속성들
              const colorProps = {
                'color': '#000000',
                'backgroundColor': 'transparent',
                'borderTopColor': '#d1d5db',
                'borderRightColor': '#d1d5db',
                'borderBottomColor': '#d1d5db',
                'borderLeftColor': '#d1d5db',
                'fill': 'currentColor',
                'stroke': 'currentColor'
              };

              Object.entries(colorProps).forEach(([prop, fallback]) => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(') || value.includes('oklab('))) {
                  // Tailwind 클래스 기반 fallback
                  if (element.className) {
                    const classes = element.className.toString();
                    // 파란색 계열
                    if (classes.includes('blue')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#3b82f6' : (prop === 'backgroundColor' ? '#eff6ff' : '#3b82f6'), 'important');
                    }
                    // 회색 계열
                    else if (classes.includes('gray')) {
                      const grayMap: { [key: string]: string } = {
                        'color': '#6b7280',
                        'backgroundColor': '#f3f4f6',
                        'default': '#9ca3af'
                      };
                      htmlElement.style.setProperty(prop, grayMap[prop] || grayMap['default'], 'important');
                    }
                    // 녹색 계열
                    else if (classes.includes('green') || classes.includes('emerald')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#10b981' : (prop === 'backgroundColor' ? '#d1fae5' : '#10b981'), 'important');
                    }
                    // 빨간색 계열
                    else if (classes.includes('red') || classes.includes('rose')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#ef4444' : (prop === 'backgroundColor' ? '#fee2e2' : '#ef4444'), 'important');
                    }
                    // 보라색 계열
                    else if (classes.includes('purple')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#a855f7' : (prop === 'backgroundColor' ? '#f3e8ff' : '#a855f7'), 'important');
                    }
                    // 호박색 계열
                    else if (classes.includes('amber')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#f59e0b' : (prop === 'backgroundColor' ? '#fef3c7' : '#f59e0b'), 'important');
                    }
                    else {
                      htmlElement.style.setProperty(prop, fallback, 'important');
                    }
                  } else {
                    htmlElement.style.setProperty(prop, fallback, 'important');
                  }
                }
              });

              // 3. SVG 특별 처리
              if (element.tagName.toLowerCase() === 'svg' || element.tagName.toLowerCase() === 'path') {
                htmlElement.style.color = '';
                const fill = computedStyle.getPropertyValue('fill');
                const stroke = computedStyle.getPropertyValue('stroke');

                if (fill && (fill.includes('lab(') || fill.includes('oklch('))) {
                  htmlElement.setAttribute('fill', 'currentColor');
                }
                if (stroke && (stroke.includes('lab(') || stroke.includes('oklch('))) {
                  htmlElement.setAttribute('stroke', 'currentColor');
                }
              }
            } catch (e) {
              // 개별 요소 처리 오류는 무시하고 계속
              console.warn('Element processing error:', e);
            }
          });
        },
      });

      // Canvas를 Blob으로 변환하여 다운로드
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'NHIS_제출서류_안내.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 저장 성공 후 피드백 모달 표시
        setShowFeedbackModal(true);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#f3f4f6',
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // handleSave와 동일한 색상 변환 로직 적용
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet) => {
              try {
                const rules = Array.from(sheet.cssRules || sheet.rules || []);
                rules.forEach((rule: any) => {
                  if (rule.style) {
                    const style = rule.style;
                    for (let i = 0; i < style.length; i++) {
                      const prop = style[i];
                      const value = style.getPropertyValue(prop);
                      if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(') || value.includes('oklab('))) {
                        const fallbackColors: { [key: string]: string } = {
                          'color': '#000000',
                          'background-color': 'transparent',
                          'border-color': '#000000',
                          'fill': 'currentColor',
                          'stroke': 'currentColor'
                        };
                        style.setProperty(prop, fallbackColors[prop] || 'transparent', 'important');
                      }
                    }
                  }
                });
              } catch (e) {
                console.warn('Cannot access stylesheet:', e);
              }
            });
          } catch (e) {
            console.warn('Stylesheet processing error:', e);
          }

          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((element) => {
            try {
              const computedStyle = window.getComputedStyle(element);
              const htmlElement = element as HTMLElement;
              const colorProps = {
                'color': '#000000',
                'backgroundColor': 'transparent',
                'borderTopColor': '#d1d5db',
                'borderRightColor': '#d1d5db',
                'borderBottomColor': '#d1d5db',
                'borderLeftColor': '#d1d5db',
                'fill': 'currentColor',
                'stroke': 'currentColor'
              };

              Object.entries(colorProps).forEach(([prop, fallback]) => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(') || value.includes('oklab('))) {
                  if (element.className) {
                    const classes = element.className.toString();
                    if (classes.includes('blue')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#3b82f6' : (prop === 'backgroundColor' ? '#eff6ff' : '#3b82f6'), 'important');
                    } else if (classes.includes('gray')) {
                      const grayMap: { [key: string]: string } = {
                        'color': '#6b7280',
                        'backgroundColor': '#f3f4f6',
                        'default': '#9ca3af'
                      };
                      htmlElement.style.setProperty(prop, grayMap[prop] || grayMap['default'], 'important');
                    } else if (classes.includes('green') || classes.includes('emerald')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#10b981' : (prop === 'backgroundColor' ? '#d1fae5' : '#10b981'), 'important');
                    } else if (classes.includes('red') || classes.includes('rose')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#ef4444' : (prop === 'backgroundColor' ? '#fee2e2' : '#ef4444'), 'important');
                    } else if (classes.includes('purple')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#a855f7' : (prop === 'backgroundColor' ? '#f3e8ff' : '#a855f7'), 'important');
                    } else if (classes.includes('amber')) {
                      htmlElement.style.setProperty(prop, prop === 'color' ? '#f59e0b' : (prop === 'backgroundColor' ? '#fef3c7' : '#f59e0b'), 'important');
                    } else {
                      htmlElement.style.setProperty(prop, fallback, 'important');
                    }
                  } else {
                    htmlElement.style.setProperty(prop, fallback, 'important');
                  }
                }
              });

              if (element.tagName.toLowerCase() === 'svg' || element.tagName.toLowerCase() === 'path') {
                htmlElement.style.color = '';
                const fill = computedStyle.getPropertyValue('fill');
                const stroke = computedStyle.getPropertyValue('stroke');
                if (fill && (fill.includes('lab(') || fill.includes('oklch('))) {
                  htmlElement.setAttribute('fill', 'currentColor');
                }
                if (stroke && (stroke.includes('lab(') || stroke.includes('oklch('))) {
                  htmlElement.setAttribute('stroke', 'currentColor');
                }
              }
            } catch (e) {
              console.warn('Element processing error:', e);
            }
          });
        },
      });

      // Canvas를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const file = new File([blob], 'NHIS_제출서류_안내.png', {
          type: 'image/png',
        });

        // Web Share API 지원 확인
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '건강보험 환급금 제출서류 안내',
              text: '건강보험 환급금 신청에 필요한 서류 안내입니다.',
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('공유 실패:', error);
              alert('공유에 실패했습니다. 다시 시도해주세요.');
            }
          }
        } else {
          alert('이 브라우저는 공유 기능을 지원하지 않습니다. 저장하기 버튼을 이용해주세요.');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header with Progress */}
      <header className="px-6 pt-4 pb-3">
        <div className="flex items-center gap-4 mb-3">
          {step === 1 ? (
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </Link>
            </>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-emerald-600 h-1 rounded-full transition-all duration-300 max-w-full"
            style={{
              width: `${Math.min(100,
                situation === 'deceased'
                  ? (step / 18) * 100
                  : accountHolder === 'self'
                  ? (step / 3) * 100
                  : accountHolder === 'family' && refundAmount === 'under300k'
                  ? (step / 5) * 100
                  : accountHolder === 'family' && refundAmount === 'over300k'
                  ? (step / 7) * 100
                  : accountHolder === 'other'
                  ? (step / 8) * 100
                  : (step / 3) * 100
              )}%`
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-4 overflow-hidden">
        {step === 1 && (
          <>
            {/* Question */}
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                진료받으신 분은
                <br />
                현재 어떤 상황인가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSituationSelect('alive')}
                className={`rounded-2xl border-2 transition-all active:scale-[0.98] py-5 px-5 ${
                  situation === 'alive'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    situation === 'alive' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${situation === 'alive' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">생존</span>
                </div>
              </button>

              <button
                onClick={() => handleSituationSelect('deceased')}
                className={`rounded-2xl border-2 transition-all active:scale-[0.98] py-5 px-5 ${
                  situation === 'deceased'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    situation === 'deceased' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${situation === 'deceased' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">사망</span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 생존 - 상세 상황 선택 */}
        {step === 2 && situation === 'alive' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                진료받으신 분의 상황은
                <br />
                다음 중 어떤 상황인가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAliveDetailSelect('adult')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">성인</span>
                </div>
              </button>

              <button
                onClick={() => handleAliveDetailSelect('minor')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-semibold text-[#1A1A1A]">미성년자</div>
                    <div className="text-base text-gray-500 mt-0.5">(만 19세 미만)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAliveDetailSelect('guardian_adult')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-semibold text-[#1A1A1A]">성년이며</div>
                    <div className="text-2xl font-semibold text-[#1A1A1A]">후견인 있음</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: 예금주 선택 (일반 성인) */}
        {step === 3 && situation === 'alive' && aliveDetailType === 'adult' && (
          <>
            {/* Question */}
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                누구 통장으로 받으시나요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAccountHolderSelect('self')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'self'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    accountHolder === 'self' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${accountHolder === 'self' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-semibold text-[#1A1A1A] mb-0.5">본인</div>
                    <div className="text-base text-gray-500">진료받은 분 본인</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAccountHolderSelect('family')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'family'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    accountHolder === 'family' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${accountHolder === 'family' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-semibold text-[#1A1A1A] mb-0.5">가족</div>
                    <div className="text-base text-gray-500">배우자/부모/자녀/손자녀</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAccountHolderSelect('other')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'other'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    accountHolder === 'other' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${accountHolder === 'other' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-semibold text-[#1A1A1A] mb-0.5">타인</div>
                    <div className="text-base text-gray-500">위 가족 외 모든 분</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 5: 환급금 금액 선택 (가족인 경우) */}
        {step === 5 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'family' && (
          <>
            {/* Question */}
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                환급금 지급예정금액이
                <br />
                얼마인가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRefundAmountSelect('under300k')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] p-5 ${
                  refundAmount === 'under300k'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    refundAmount === 'under300k' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${refundAmount === 'under300k' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">30만원 이하</span>
                </div>
              </button>

              <button
                onClick={() => handleRefundAmountSelect('over300k')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] p-5 ${
                  refundAmount === 'over300k'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    refundAmount === 'over300k' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${refundAmount === 'over300k' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">30만원 초과</span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 4: 본인 결과 */}
        {step === 4 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'self' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">유선, 팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 mt-2">
                {/* 전화로 신청하기 */}
                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  전화로 신청하기
                </a>

                {/* 저장하기 & 공유하기 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 7: 의사표현 가능 여부 (가족 30만원 초과) */}
        {step === 7 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'family' && refundAmount === 'over300k' && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분이
                <br />
                의사표현이 가능한가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCanExpressSelect('yes')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  canExpress === 'yes'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-2xl font-bold text-gray-900">가능</span>
              </button>

              <button
                onClick={() => handleCanExpressSelect('no')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  canExpress === 'no'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-2xl font-bold text-gray-900">불가능(치매, 의식불명 등)</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 6: 가족 30만원 이하 결과 */}
        {step === 6 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'family' && refundAmount === 'under300k' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">유선, 팩스, 우편, 내방<br /><span className="text-base text-gray-500">(유선은 전산상 가족관계 확인 가능 시)</span></span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급본</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 mt-2">
                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  전화로 신청하기
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 8 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'family' && refundAmount === 'over300k' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    {canExpress === 'yes' ? (
                      <>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                          <button
                            onClick={() => setSampleImage('/환급금 지급신청서.png')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                          >
                            작성예시
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800 flex-1">상한제 위임장</span>
                          <button
                            onClick={() => setSampleImage('/상한제 위임장.png')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                          >
                            작성예시
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-xl text-gray-800">가족관계증명서(상세)</span>
                            <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급본</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800">예금주 신분증 사본</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800">진료받은 분 신분증 사본</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                          <button
                            onClick={() => setSampleImage('/환급금 지급신청서.png')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                          >
                            작성예시
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800">진단서(소견서)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-xl text-gray-800">가족관계증명서(상세)</span>
                            <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급본</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xl text-gray-800">예금주 신분증 사본</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 9 && situation === 'alive' && aliveDetailType === 'adult' && accountHolder === 'other' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">상한제 위임장 원본</span>
                      <button
                        onClick={() => setSampleImage('/상한제 위임장.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800">진료받은 분 신분증 사본</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800">예금주 신분증 사본</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 9 && situation === 'deceased' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                환급금 지급예정금액이<br />얼마인가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRefundAmountSelect('under300k')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] ${
                  refundAmount === 'under300k'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">100만원 이하</span>
                </div>
              </button>

              <button
                onClick={() => handleRefundAmountSelect('over300k')}
                className={`min-h-[68px] rounded-[16px] border-2 transition-all active:scale-[0.98] ${
                  refundAmount === 'over300k'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-semibold text-[#1A1A1A]">100만원 초과</span>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 10 && situation === 'deceased' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                지급받으실 분은<br />사망하신 분과 어떤 관계인가요?
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-2xl text-[#1A1A1A]">
                사망하신 분의
              </div>
              <select
                value={deceasedRelationship || ''}
                onChange={(e) => handleDeceasedRelationshipSelect(e.target.value as DeceasedRelationship)}
                className="w-full min-h-[68px] rounded-[16px] border-2 border-gray-200 px-6 text-2xl font-semibold text-[#1A1A1A] bg-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>선택해주세요</option>
                {refundAmount === 'under300k' ? (
                  <>
                    <option value="child">자녀</option>
                    <option value="spouse">배우자</option>
                    <option value="parent">부모</option>
                    <option value="grandchild">손자녀</option>
                    <option value="heir_guardian">상속인의 후견인</option>
                  </>
                ) : (
                  <>
                    <option value="child">자녀 (아들/딸)</option>
                    <option value="spouse">배우자 (남편/아내)</option>
                    <option value="grandchild">손자녀 (손자/손녀)</option>
                    <option value="parent">부모 (아버지/어머니)</option>
                    <option value="grandparent">조부모 (할아버지/할머니)</option>
                    <option value="sibling">형제자매</option>
                    <option value="fourth_degree">4촌 이내 친척</option>
                    <option value="heir_guardian">상속인의 후견인</option>
                  </>
                )}
              </select>
              <div className="text-2xl text-[#1A1A1A]">
                입니다.
              </div>
            </div>
          </>
        )}

        {/* STEP 1: 배우자 확인 */}
        {step === 11 && situation === 'deceased' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                {deceasedRelationship === 'parent'
                  ? <>진료받은 분께서<br />배우자가 있으셨나요?</>
                  : refundAmount === 'under300k' && deceasedRelationship === 'grandchild'
                  ? <>사망하신 분의<br />배우자가 계신가요?</>
                  : <>배우자(법률혼)가<br />계신가요?</>
                }
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSpouseCheck(true)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">예</span>
              </button>

              <button
                onClick={() => handleSpouseCheck(false)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 1순위 (자녀/손자녀) 확인 */}
        {step === 12 && situation === 'deceased' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                {refundAmount === 'under300k' && (deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild')
                  ? <>사망하신 분께서<br />자녀가 계신가요?</>
                  : <>자녀나 손자녀가<br />있나요?</>
                }
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleChildrenCheck(true)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">예</span>
              </button>

              <button
                onClick={() => handleChildrenCheck(false)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: 2순위 (부모/조부모) 확인 */}
        {step === 13 && situation === 'deceased' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                부모님이나 조부모님이<br />계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentsCheck(true)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">예</span>
              </button>

              <button
                onClick={() => handleParentsCheck(false)}
                className="min-h-[68px] rounded-[16px] border-2 bg-white border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl font-semibold text-[#1A1A1A]">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 4: 배우자 단독 체크 (자동) - 배우자가 있으면 바로 결과로, 없으면 STEP 5로 */}
        {step === 14 && situation === 'deceased' && hasSpouse && (
          <>
            {/* 배우자 단독 케이스 - 결과로 이동 */}
            {(() => {
              navigateToStep(18);
              return null;
            })()}
          </>
        )}
        {step === 14 && situation === 'deceased' && !hasSpouse && (
          <>
            {/* STEP 5로 이동 */}
            {(() => {
              navigateToStep(15);
              return null;
            })()}
          </>
        )}

        {/* STEP 5: 3순위 (형제자매) 확인 */}
        {step === 15 && situation === 'deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                형제자매가
                <br />
                있나요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingsCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingsCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 6: 4촌 이내 친척 확인 */}
        {step === 17 && situation === 'deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                4촌 이내 친척이
                <br />
                있나요?
                <br />
                <span className="text-2xl text-gray-600">(삼촌, 고모, 이모, 사촌 등)</span>
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleFourthDegreeCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleFourthDegreeCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 18: 사망 케이스 결과 */}
        {step === 18 && situation === 'deceased' && refundAmount === 'under300k' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {(deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild') ? (
                        <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                      ) : (
                        <span className="text-xl text-gray-800">팩스, 우편, 방문, 유선<br /><span className="text-base text-gray-500">(유선은 전산상 가족관계 확인 시)</span></span>
                      )}
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">상속대표선정동의서</span>
                        <div className="text-base text-gray-500 mt-1">- 생략 가능</div>
                      </div>
                      <button
                        onClick={() => setSampleImage('/상속대표선정동의서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 mt-2">
                {(deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild') ? (
                  <Link
                    href="/branch"
                    className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    지사 팩스번호 찾기
                  </Link>
                ) : (
                  <a
                    href="tel:1577-1000"
                    className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    전화로 신청하기
                  </a>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 19: 지급불가 결과 (100만원 이하, 부모/손자녀이나 1순위 상속자 있음) */}
        {step === 19 && situation === 'deceased' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">지급 불가</h2>
                  <div className="text-2xl text-red-800 leading-relaxed">
                    선순위 상속인이 계시므로
                    <br />
                    환급금 지급이 불가능합니다.
                    <br />
                    <br />
                    선순위 상속인께서 직접
                    <br />
                    신청하셔야 합니다.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 자녀 케이스 === */}

        {/* STEP 20: 배우자 확인 (자녀 케이스) */}
        {step === 20 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 배우자가
                <br />
                현재 생존해 계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleChildCaseSpouseCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleChildCaseSpouseCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 21: 형제자매 상황 */}
        {step === 21 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분께서
                <br />
                자녀가 있으신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingStatusSelect('only_child')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">자녀가 1명(외동)</div>
                <div className="text-2xl font-bold text-gray-900">뿐입니다</div>
              </button>

              <button
                onClick={() => handleSiblingStatusSelect('all_alive')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">자녀가 여러 명이며,</div>
                <div className="text-2xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleSiblingStatusSelect('some_deceased')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">자녀 중 진료받은 분보다</div>
                <div className="text-2xl font-bold text-gray-900">먼저 사망한 분이 있습니다</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 22: 대습상속 확인 */}
        {step === 22 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && siblingStatus === 'some_deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                사망한 형제자매분 중
                <br />
                배우자나 자녀(손자녀)가
                <br />
                있는 분이 계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDaeseupCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleDaeseupCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 23: 자녀 케이스 결과 */}
        {step === 23 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {(hasSpouse || siblingStatus !== 'only_child') && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    {hasDaeseup && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">사망한 자녀 기준 가족관계증명서(상세)</span>
                          <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">자녀 (신청인 포함)</span>
                    </div>
                    {hasSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">배우자 (진료받은 분의 배우자)</span>
                      </div>
                    )}
                    {hasDaeseup && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">손자녀 (사망한 자녀의 자녀 - 대습상속)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 배우자 케이스 === */}

        {/* STEP 24: 자녀/손자녀 확인 (배우자 케이스) */}
        {step === 24 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 자녀나
                <br />
                손자녀가 있나요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSpouseCaseChildrenCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseChildrenCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 25: 자녀 상황 (배우자 케이스) */}
        {step === 25 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분께서
                <br />
                자녀가 있으신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleChildStatusSelect('one_child')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">자녀 1명(외동)</div>
                <div className="text-2xl font-bold text-gray-900">뿐입니다</div>
              </button>

              <button
                onClick={() => handleChildStatusSelect('multiple_alive')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">자녀가 여러 명이며</div>
                <div className="text-2xl font-bold text-gray-900">모두 생존</div>
              </button>

              <button
                onClick={() => handleChildStatusSelect('some_deceased')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">먼저 사망한</div>
                <div className="text-2xl font-bold text-gray-900">자녀가 있습니다</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 26: 대습상속 확인 (배우자 케이스) */}
        {step === 26 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && childStatus === 'some_deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                사망한 자녀분 중
                <br />
                배우자나 자녀(손자녀)가
                <br />
                있는 분이 계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSpouseCaseDaeseupCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseDaeseupCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 27: 부모님 확인 (배우자 케이스, 자녀 없을 때) */}
        {step === 27 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && !hasChildren && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 부모님이
                <br />
                계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSpouseCaseParentsCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseParentsCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 28: 배우자 케이스 결과 */}
        {step === 28 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {hasChildren && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    {hasDaeseup && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">사망한 자녀 기준 가족관계증명서(상세)</span>
                          <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">배우자 (신청인)</span>
                    </div>
                    {hasChildren && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">자녀</span>
                      </div>
                    )}
                    {!hasChildren && hasParents && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">부모</span>
                      </div>
                    )}
                    {hasDaeseup && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">손자녀 (사망한 자녀의 자녀 - 대습상속)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 손자녀 케이스 === */}

        {/* STEP 29: 부모 생존 확인 (손자녀 케이스) */}
        {step === 29 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                신청인의 부모님
                <br />
                (진료받은 분의 자녀)이
                <br />
                살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleGrandchildCaseParentCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandchildCaseParentCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 30: 조부모 배우자 확인 (손자녀 케이스) */}
        {step === 30 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && !hasParentAlive && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 배우자
                <br />
                (할머니/할아버지)가
                <br />
                생존해 계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleGrandparentSpouseCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandparentSpouseCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 31: 다른 자녀 상황 (손자녀 케이스) */}
        {step === 31 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 다른 자녀분들은
                <br />
                어떤 상황인가요?
              </h1>
              <p className="text-2xl text-gray-600 mt-4">(신청인 부모님 외 다른 자녀)</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleOtherChildrenStatusSelect('none')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">다른 자녀는 없습니다</div>
                <div className="text-2xl text-gray-600">(부모님이 외동)</div>
              </button>

              <button
                onClick={() => handleOtherChildrenStatusSelect('all_alive')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">다른 자녀들이</div>
                <div className="text-2xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleOtherChildrenStatusSelect('some_deceased')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">먼저 돌아가신</div>
                <div className="text-2xl font-bold text-gray-900">다른 자녀가 있습니다</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 32: 추가 대습상속 확인 (손자녀 케이스) */}
        {step === 32 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && otherChildrenStatus === 'some_deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                그 돌아가신 자녀분의
                <br />
                배우자나 자녀가
                <br />
                있나요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleOtherDaeseupCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleOtherDaeseupCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 33: 손자녀 케이스 결과 */}
        {step === 33 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {(otherChildrenStatus !== 'none' || hasGrandparentSpouse || hasOtherDaeseup) && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">신청인 부모 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    {hasOtherDaeseup && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">돌아가신 다른 자녀 기준 가족관계증명서(상세)</span>
                          <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">손자녀 (신청인 - 대습상속)</span>
                    </div>
                    {otherChildrenStatus !== 'none' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">다른 자녀 (살아계신 분)</span>
                      </div>
                    )}
                    {hasGrandparentSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">배우자 (할머니/할아버지)</span>
                      </div>
                    )}
                    {hasOtherDaeseup && (
                      <>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xl text-gray-800">돌아가신 다른 자녀의 배우자 (대습상속)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xl text-gray-800">돌아가신 다른 자녀의 자녀 (대습상속)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 34: 신청 불가 (손자녀 케이스 - 부모 생존) */}
        {step === 34 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && hasParentAlive && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">신청 불가</h2>
                  <div className="text-2xl text-red-800 leading-relaxed">
                    부모님이 상속인이므로
                    <br />
                    부모님이 신청하셔야 합니다.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 형제자매 케이스 === */}

        {/* STEP 35: 선순위 상속인 확인 (형제자매 케이스) */}
        {step === 35 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 배우자,
                <br />
                직계가족(자녀/손자녀/
                <br />
                부모/조부모) 중 한 분이라도
                <br />
                살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingCaseSeniorHeirsCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingCaseSeniorHeirsCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 36: 형제자매 상황 (형제자매 케이스) */}
        {step === 36 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && !hasSeniorHeirs && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 형제자매는
                <br />
                어떤 상황인가요?
              </h1>
              <p className="text-2xl text-gray-600 mt-4">(신청인 본인 포함)</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingsStatusTypeSelect('only_self')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">본인뿐입니다</div>
              </button>

              <button
                onClick={() => handleSiblingsStatusTypeSelect('multiple_alive')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">여러 명이고</div>
                <div className="text-2xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleSiblingsStatusTypeSelect('some_deceased')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="text-2xl font-bold text-gray-900">여러 명이고</div>
                <div className="text-2xl font-bold text-gray-900">먼저 돌아가신 분이 있습니다</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 37: 대습상속 확인 (형제자매 케이스) */}
        {step === 37 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && siblingsStatusType === 'some_deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                먼저 돌아가신 형제분의
                <br />
                배우자나 자녀가
                <br />
                있나요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingDaeseupCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingDaeseupCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 38: 형제자매 케이스 결과 */}
        {step === 38 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {siblingsStatusType !== 'only_self' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    {siblingsStatusType === 'only_self' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">진료받은 분의 부모님 기준 가족관계증명서(상세)</span>
                          <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                        </div>
                      </div>
                    )}
                    {siblingsStatusType === 'some_deceased' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">사망한 형제(자매) 기준 가족관계증명서(상세)</span>
                          <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    {siblingsStatusType === 'only_self' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">형제자매 (신청인 단독)</span>
                      </div>
                    )}
                    {siblingsStatusType !== 'only_self' && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">형제자매 (살아계신 분들)</span>
                      </div>
                    )}
                    {hasSiblingDaeseup && (
                      <>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xl text-gray-800">돌아가신 형제의 배우자 (대습상속)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xl text-gray-800">돌아가신 형제의 자녀 (대습상속)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 39: 신청 불가 (형제자매 케이스 - 선순위 상속인 존재) */}
        {step === 39 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && hasSeniorHeirs && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">신청 불가</h2>
                  <div className="text-2xl text-red-800 leading-relaxed">
                    민법상 선순위 상속인
                    <br />
                    (배우자/직계가족)이 계시므로
                    <br />
                    형제자매는 상속권이 없습니다.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 4촌 이내 친척 케이스 === */}

        {/* STEP 40: 지사 방문 및 전화 상담 안내 */}
        {step === 40 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'fourth_degree' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-300">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>지사 방문 및 전화 상담 필요</span>
                  </h2>

                  <div className="text-2xl text-orange-900 leading-relaxed mb-6">
                    4촌 이내 친척 상속은 선순위 상속인
                    <br />
                    (배우자, 자녀, 부모, 형제자매 등)이
                    <br />
                    모두 없는 경우에만 가능하며,
                    <br />
                    증빙 서류가 매우 복잡합니다.
                  </div>

                  <div className="bg-white rounded-xl p-5 space-y-4">
                    <div className="text-2xl font-bold text-gray-900 mb-3">핵심 안내사항:</div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 정확한 상속인 확인 필요</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          3촌(삼촌, 고모 등)과 4촌(사촌 등) 간의
                          <br />
                          우선순위 확인이 필요합니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 필수 서류 복잡</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          진료받은 분의 제적등본 및 가계 확인을 위한
                          <br />
                          방대한 서류가 요구됩니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 지사 방문 권장</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          서류 누락 방지를 위해 가까운
                          <br />
                          국민건강보험공단 지사를 방문하시거나
                          <br />
                          고객센터로 먼저 상담해 주세요.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 손자녀 케이스 === */}

        {/* STEP 41: 지사 방문 및 전화 상담 안내 (손자녀 케이스) */}
        {step === 41 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-300">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>지사 방문 및 전화 상담 필요</span>
                  </h2>

                  <div className="text-2xl text-orange-900 leading-relaxed mb-6">
                    손자녀 상속은 상속인 관계가
                    <br />
                    복잡하여 정확한 상속인 확인 및
                    <br />
                    서류 준비가 필요합니다.
                  </div>

                  <div className="bg-white rounded-xl p-5 space-y-4">
                    <div className="text-2xl font-bold text-gray-900 mb-3">핵심 안내사항:</div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 대습상속 여부 확인 필요</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          부모님(진료받은 분의 자녀)이 사망한 경우
                          <br />
                          대습상속이 가능하며, 다른 상속인 확인이
                          <br />
                          필요합니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 필수 서류 복잡</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          진료받은 분 기준 가족관계증명서,
                          <br />
                          부모님 기준 가족관계증명서 등
                          <br />
                          여러 서류가 필요합니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 지사 방문 권장</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          정확한 상속인 확인 및 서류 누락 방지를 위해
                          <br />
                          가까운 국민건강보험공단 지사를 방문하시거나
                          <br />
                          고객센터로 먼저 상담해 주세요.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}

        {/* === 미성년자 케이스 === */}

        {/* STEP 42: 부모님 관계 확인 (미성년자) */}
        {step === 42 && situation === 'alive' && aliveDetailType === 'minor' && (
          <>
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">
                아이 부모님의 현재 상황을
                <br />
                알려주세요
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentRelationStatusSelect('both_married')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-semibold text-[#1A1A1A]">현재 두 분이 혼인 관계이심</div>
                    <div className="text-base text-gray-500 mt-0.5">(이혼/사별 안 함)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleParentRelationStatusSelect('divorced_or_bereaved')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-semibold text-[#1A1A1A]">이혼 또는 한 분이 사별하심</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleParentRelationStatusSelect('both_deceased')}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-semibold text-[#1A1A1A]">두 분 모두 돌아가셨음</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 46: 일반 부모 대리 신청 (미성년자 - 부모 혼인 중) */}
        {step === 46 && situation === 'alive' && aliveDetailType === 'minor' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">유선<br /><span className="text-base text-gray-500">(※ 조건: 부, 모, 자녀 주민등록 주소 동일)</span></span>
                    </div>
                  </div>
                </div>

                {/* 제출서류 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">부모님 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 47: 친권자/후견인 확인 필요 (미성년자 - 이혼/사별/양쪽 사망) */}
        {step === 47 && situation === 'alive' && aliveDetailType === 'minor' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>
                </div>

                {/* 제출서류 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800">아이 기준 기본증명서(상세)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 48: 성년후견인 있음 결과 */}
        {step === 48 && situation === 'alive' && aliveDetailType === 'guardian_adult' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800">후견 등기사항증명서</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800">성년후견인 신분증 사본</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 49: 상속인의 후견인 - 지사 방문 안내 */}
        {step === 49 && situation === 'deceased' && deceasedRelationship === 'heir_guardian' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-300">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>지사 방문 및 전화 상담 필요</span>
                  </h2>

                  <div className="text-2xl text-orange-900 leading-relaxed mb-6">
                    상속인의 후견인
                    <br />
                    (미성년 후견인 포함)의 경우
                    <br />
                    필요 서류가 복잡하여
                    <br />
                    정확한 안내가 필요합니다.
                  </div>

                  <div className="bg-white rounded-xl p-5 space-y-4">
                    <div className="text-2xl font-bold text-gray-900 mb-3">핵심 안내사항:</div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 후견 관계 확인 필요</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          상속인과 후견인의 관계 및
                          <br />
                          후견 형태에 따라 필요 서류가 다릅니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 정확한 서류 안내</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          개별 상황에 맞는 정확한 서류 안내를 위해
                          <br />
                          지사 방문 또는 전화 상담이 필요합니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 지사 방문 권장</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          가까운 국민건강보험공단 지사를 방문하시거나
                          <br />
                          고객센터로 먼저 상담해 주세요.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}

        {/* STEP 50: 대습상속 케이스 - 지사 상담 안내 */}
        {step === 50 && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-300">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>지사 방문 및 전화 상담 필요</span>
                  </h2>

                  <div className="text-2xl text-orange-900 leading-relaxed mb-6">
                    대습상속이 포함된 경우
                    <br />
                    필요 서류가 복잡하여
                    <br />
                    정확한 안내가 필요합니다.
                  </div>

                  <div className="bg-white rounded-xl p-5 space-y-4">
                    <div className="text-2xl font-bold text-gray-900 mb-3">핵심 안내사항:</div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 대습상속이란?</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          상속인이 사망한 경우,
                          <br />
                          그 자녀나 배우자가 대신 상속받는 제도입니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 복잡한 서류 확인</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          대습상속인의 관계 확인 및
                          <br />
                          추가 가족관계증명서가 필요할 수 있습니다.
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-semibold text-gray-900">• 전문 상담 필요</div>
                        <div className="text-xl text-gray-700 ml-4 mt-1">
                          정확한 서류 안내를 위해
                          <br />
                          지사 방문 또는 고객센터 상담이 필요합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}

        {/* === 100만원 초과 부모 케이스 === */}

        {/* STEP 60: 선순위 상속인(자녀/손자녀) 확인 */}
        {step === 60 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'parent' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 자녀나
                <br />
                손자녀가 한 명이라도
                <br />
                살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentCaseSeniorHeirsCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleParentCaseSeniorHeirsCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 61: 신청 불가 (선순위 상속인 존재) */}
        {step === 61 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'parent' && hasSeniorHeirsForParent && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">신청 불가</h2>
                  <div className="text-2xl text-red-800 leading-relaxed">
                    민법상 1순위 상속인
                    <br />
                    (자녀/손자녀)이 계시므로
                    <br />
                    부모님은 상속권이 없습니다.
                    <br />
                    <br />
                    자녀분이 직접
                    <br />
                    신청하셔야 합니다.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 62: 배우자 확인 (부모 케이스) */}
        {step === 62 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'parent' && !hasSeniorHeirsForParent && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의<br />배우자가<br />살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentCaseSpouseCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleParentCaseSpouseCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 64: 부모 케이스 결과 */}
        {step === 64 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'parent' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {hasSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">부모</span>
                    </div>
                    {hasSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">배우자</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 65: 조부모 케이스 - 1순위 상속인 확인 */}
        {step === 65 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandparent' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의<br />자녀나 손자녀가<br />한 명이라도 살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleGrandparentCaseSeniorHeirsCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandparentCaseSeniorHeirsCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 66: 조부모 케이스 - 신청 불가 */}
        {step === 66 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandparent' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300">
                  <h2 className="text-3xl font-bold text-red-900 mb-6 flex items-center gap-2">
                    <span>❌</span>
                    <span>조부모님은 신청할 수 없습니다</span>
                  </h2>
                  <div className="text-2xl text-red-900 leading-relaxed mb-4">
                    {hasSeniorHeirsForGrandparent
                      ? '민법상 1순위 상속인(자녀/손자녀)이 계시므로 조부모님은 상속권이 없습니다.'
                      : '진료받은 분의 부모님 중 한 분이라도 살아계시면 촌수가 더 가까운 부모님이 우선 상속인이 됩니다.'
                    }
                  </div>
                  <div className="text-xl text-red-800 bg-red-100 rounded-xl p-4">
                    {hasSeniorHeirsForGrandparent
                      ? '→ 자녀분 또는 손자녀분이 신청하셔야 합니다.'
                      : '→ 부모님이 신청하셔야 합니다.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 67: 조부모 케이스 - 부모 사망 확인 */}
        {step === 67 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandparent' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의<br />부모님이<br />모두 돌아가셨나요?
              </h1>
              <p className="text-2xl text-gray-600 mt-4">(생물학적 부모 기준)</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentsDeceasedCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예 (모두 돌아가심)</span>
              </button>

              <button
                onClick={() => handleParentsDeceasedCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오 (한 분이라도 생존)</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 68: 조부모 케이스 - 배우자 확인 */}
        {step === 68 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandparent' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의<br />배우자가<br />살아계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleGrandparentCaseSpouseCheck(true)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandparentCaseSpouseCheck(false)}
                className="rounded-2xl border-2 transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-blue-300 py-5 px-5"
              >
                <span className="text-2xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 69: 조부모 케이스 결과 */}
        {step === 69 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandparent' && (
          <>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-4" style={{ backgroundColor: '#f3f4f6' }}>
                {/* 신청방법 & 제출서류 통합 카드 */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떻게 신청하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">팩스, 우편, 내방</span>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">어떤 서류를 제출해야하나요?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xl text-gray-800 flex-1">환급금 지급신청서</span>
                      <button
                        onClick={() => setSampleImage('/환급금 지급신청서.png')}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        작성예시
                      </button>
                    </div>
                    {hasSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xl text-gray-800">상속대표선정동의서</span>
                          <div className="text-base text-gray-500 mt-1">- 상속인 전원 서명 필요</div>
                        </div>
                        <button
                          onClick={() => setSampleImage('/상속대표선정동의서.png')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          작성예시
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xl text-gray-800">진료받은 분의 부모님 기준 가족관계증명서(상세)</span>
                        <div className="text-base text-gray-500 mt-1">- 최근 3개월 이내 발급 분 (부모님 사망 증명용)</div>
                      </div>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-gray-200 my-6"></div>

                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-5">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xl text-gray-800">조부모</span>
                    </div>
                    {hasSpouse && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xl text-gray-800">배우자</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xl font-semibold">도움이 되었어요</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4 px-4">
                <Link
                  href="/branch"
                  className="w-full bg-blue-600 text-white rounded-[16px] py-5 px-6 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                >
                  지사 팩스번호 찾기
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-blue-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
                  >
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 작성 예시 이미지 모달 */}
      {sampleImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSampleImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSampleImage(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="닫기"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 이미지 */}
            <div className="overflow-auto max-h-[90vh]">
              <img
                src={sampleImage}
                alt="작성 예시"
                className="w-full h-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* 저장 완료 피드백 모달 */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-[90%] shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-6">
              {/* 체크 아이콘 */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* 메시지 */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">사진으로 저장 완료!</h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  필요한 서류를<br />모두 확인하셨어요
                </p>
                <p className="text-xl text-gray-700 leading-relaxed">
                  이제 준비만 하시면<br />됩니다! 💪
                </p>
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* 피드백 질문 */}
              <div className="space-y-4">
                <p className="text-xl text-gray-700 font-semibold">이 안내가<br />도움이 되셨나요?</p>

                {/* 이모지 버튼들 */}
                <div className="flex justify-center gap-6 pt-2">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😊</span>
                    <span className="text-sm text-gray-600">좋아요</span>
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😐</span>
                    <span className="text-sm text-gray-600">보통</span>
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😢</span>
                    <span className="text-sm text-gray-600">아쉬워요</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
