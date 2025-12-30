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
type MinorApplicantType = 'parent' | 'guardian' | 'other' | null;
type ParentMaritalStatus = 'married' | 'divorced_or_separated' | null;

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

  // 미성년자 케이스용 state
  const [minorApplicantType, setMinorApplicantType] = useState<MinorApplicantType>(null);
  const [parentMaritalStatus, setParentMaritalStatus] = useState<ParentMaritalStatus>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const captureRef = useRef<HTMLDivElement>(null);

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
    // 100만원 초과이고 손자녀 선택 시 손자녀 전용 플로우로
    else if (refundAmount === 'over300k' && selected === 'grandchild') {
      navigateToStep(29); // 손자녀 케이스 STEP 1: 부모 생존 확인
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
    // 부모, 또는 100만원 초과 기타 관계인 경우 배우자 확인으로
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
      navigateToStep(23); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(22); // STEP 3: 대습상속 확인으로
    }
  };

  // STEP 3: 대습상속 확인
  const handleDaeseupCheck = (hasDaeseupValue: boolean) => {
    setHasDaeseup(hasDaeseupValue);
    setAnswers({ ...answers, hasDaeseup: hasDaeseupValue });
    navigateToStep(23); // 결과로
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
      navigateToStep(28); // 바로 결과로
    } else if (status === 'some_deceased') {
      navigateToStep(26); // STEP: 대습상속 확인으로
    }
  };

  // STEP: 대습상속 확인 (배우자 케이스)
  const handleSpouseCaseDaeseupCheck = (hasDaeseupValue: boolean) => {
    setHasDaeseup(hasDaeseupValue);
    setAnswers({ ...answers, hasDaeseup: hasDaeseupValue });
    navigateToStep(28); // 결과로
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
    navigateToStep(33); // 결과로
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
    navigateToStep(38); // 결과로
  };

  // === 미성년자 케이스 핸들러 ===

  // STEP 1: 신청인 확인 (미성년자 케이스)
  const handleMinorApplicantTypeSelect = (type: MinorApplicantType) => {
    setMinorApplicantType(type);
    setAnswers({ ...answers, minorApplicantType: type });

    if (type === 'parent') {
      navigateToStep(43); // STEP 2: 부모 혼인 상태 확인으로
    } else if (type === 'guardian') {
      navigateToStep(44); // 미성년후견인 결과로
    } else if (type === 'other') {
      navigateToStep(45); // 신청 불가로
    }
  };

  // STEP 2: 부모 혼인 상태 확인 (미성년자 케이스)
  const handleParentMaritalStatusSelect = (status: ParentMaritalStatus) => {
    setParentMaritalStatus(status);
    setAnswers({ ...answers, parentMaritalStatus: status });

    if (status === 'married') {
      navigateToStep(46); // 공동친권 결과로
    } else if (status === 'divorced_or_separated') {
      navigateToStep(47); // 단독친권 결과로
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
        navigateToStep(5); // 30만원 이하는 바로 결과로
      } else if (selected === 'over300k') {
        navigateToStep(6); // 30만원 초과는 의사표현 가능 여부 질문으로
      }
    }
  };

  const handleCanExpressSelect = (selected: CanExpress) => {
    setCanExpress(selected);
    setAnswers({ ...answers, canExpress: selected });
    navigateToStep(7); // 최종 결과로
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
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `제출서류_안내.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col overflow-hidden">
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
            className="bg-emerald-600 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${
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
              }%`
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-4 overflow-hidden">
        {step === 1 && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받으신 분은
                <br />
                현재 어떤 상황인가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSituationSelect('alive')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  situation === 'alive'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">생존</span>
              </button>

              <button
                onClick={() => handleSituationSelect('deceased')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  situation === 'deceased'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">사망</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 생존 - 상세 상황 선택 */}
        {step === 2 && situation === 'alive' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받으신 분의
                <br />
                상세 상황을 선택해주세요
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAliveDetailSelect('adult')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">일반 (성인)</div>
              </button>

              <button
                onClick={() => handleAliveDetailSelect('minor')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">미성년자</div>
                <div className="text-2xl text-gray-600">(만 19세 미만)</div>
              </button>

              <button
                onClick={() => handleAliveDetailSelect('guardian_adult')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">성년이며</div>
                <div className="text-3xl font-bold text-gray-900">후견인 있음</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: 예금주 선택 (일반 성인) */}
        {step === 3 && situation === 'alive' && aliveDetailType === 'adult' && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tighter">
                누구 통장으로 받으시나요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAccountHolderSelect('self')}
                className={`rounded-2xl shadow-sm border transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'self'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">본인</div>
                <div className="text-lg text-gray-600">진료받은 분 본인</div>
              </button>

              <button
                onClick={() => handleAccountHolderSelect('family')}
                className={`rounded-2xl shadow-sm border transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'family'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">가족</div>
                <div className="text-lg text-gray-600">배우자/부모/자녀/손자녀</div>
              </button>

              <button
                onClick={() => handleAccountHolderSelect('other')}
                className={`rounded-2xl shadow-sm border transition-all active:scale-[0.98] p-5 text-left ${
                  accountHolder === 'other'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">타인</div>
                <div className="text-lg text-gray-600">위 가족 외 모든 분</div>
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                환급금 지급예정금액이
                <br />
                얼마인가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRefundAmountSelect('under300k')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  refundAmount === 'under300k'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">30만원 이하</span>
              </button>

              <button
                onClick={() => handleRefundAmountSelect('over300k')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  refundAmount === 'over300k'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">30만원 초과</span>
              </button>
            </div>
          </>
        )}

        {step === 3 && accountHolder === 'self' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 유선, 팩스, 우편, 내방
                  </div>
                  <div className="text-lg text-gray-600 mt-2">
                    (유선은 전산상 가족관계 확인 가능 시)
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/branch"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  전화로 신청하기
                </a>
              </div>
            </div>
          </>
        )}

        {step === 6 && (
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
                <span className="text-3xl font-bold text-gray-900">가능</span>
              </button>

              <button
                onClick={() => handleCanExpressSelect('no')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  canExpress === 'no'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">불가능(치매, 의식불명 등)</span>
              </button>
            </div>
          </>
        )}

        {step === 5 && accountHolder === 'family' && refundAmount === 'under300k' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 유선, 팩스, 우편, 내방
                  </div>
                  <div className="text-lg text-gray-600 mt-2">
                    (유선은 전산상 가족관계 확인 가능 시)
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>
                      <div>• 가족관계증명서(상세)</div>
                      <div className="text-xl ml-4 mt-1">- 최근 3개월 이내 발급본</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/branch"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  전화로 신청하기
                </a>
              </div>
            </div>
          </>
        )}

        {step === 7 && accountHolder === 'family' && refundAmount === 'over300k' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    {canExpress === 'yes' ? (
                      <>
                        <div>• 환급금 지급신청서</div>
                        <div>• 위임장</div>
                        <div>
                          <div>• 가족관계증명서(상세)</div>
                          <div className="text-xl ml-4 mt-1">- 최근 3개월 이내 발급본</div>
                        </div>
                        <div>• 예금주 신분증 사본</div>
                        <div>• 진료받은 분 신분증 사본</div>
                      </>
                    ) : (
                      <>
                        <div>• 환급금 지급신청서</div>
                        <div>• 진단서(소견서)</div>
                        <div>
                          <div>• 가족관계증명서(상세)</div>
                          <div className="text-xl ml-4 mt-1">- 최근 3개월 이내 발급본</div>
                        </div>
                        <div>• 예금주 신분증 사본</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/branch"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 8 && accountHolder === 'other' && (
          <>
            {/* Result */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 위임장 원본</div>
                    <div>• 진료받은 분 신분증 사본</div>
                    <div>• 예금주 신분증 사본</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/branch"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  지사 위치 찾기
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 9 && situation === 'deceased' && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                환급금 지급예정금액이
                <br />
                얼마인가요?
              </h1>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRefundAmountSelect('under300k')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  refundAmount === 'under300k'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">100만원 이하</span>
              </button>

              <button
                onClick={() => handleRefundAmountSelect('over300k')}
                className={`h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] ${
                  refundAmount === 'over300k'
                    ? 'bg-emerald-50 border-emerald-500 border-2'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl font-bold text-gray-900">100만원 초과</span>
              </button>
            </div>
          </>
        )}

        {step === 10 && situation === 'deceased' && (
          <>
            {/* Question */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                지급받으실 분은
                <br />
                사망하신 분과 어떤 관계인가요?
              </h1>
            </div>

            {/* Dropdown */}
            <div className="flex flex-col gap-4">
              <div className="text-3xl text-gray-900">
                사망하신 분의
              </div>
              <select
                value={deceasedRelationship || ''}
                onChange={(e) => handleDeceasedRelationshipSelect(e.target.value as DeceasedRelationship)}
                className="w-full h-16 rounded-2xl border-2 border-gray-200 px-6 text-3xl font-semibold text-gray-900 bg-white focus:outline-none focus:border-emerald-500 transition-colors"
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
              <div className="text-3xl text-gray-900">
                입니다.
              </div>
            </div>
          </>
        )}

        {/* STEP 1: 배우자 확인 */}
        {step === 11 && situation === 'deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {refundAmount === 'under300k' && (deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild')
                  ? <>사망하신 분의<br />배우자가 계신가요?</>
                  : <>배우자(법률혼)가<br />계신가요?</>
                }
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSpouseCheck(true)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 1순위 (자녀/손자녀) 확인 */}
        {step === 12 && situation === 'deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {refundAmount === 'under300k' && (deceasedRelationship === 'parent' || deceasedRelationship === 'grandchild')
                  ? <>사망하신 분께서<br />자녀가 계신가요?</>
                  : <>자녀나 손자녀가<br />있나요?</>
                }
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleChildrenCheck(true)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleChildrenCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 3: 2순위 (부모/조부모) 확인 */}
        {step === 13 && situation === 'deceased' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                부모님이나 조부모님이
                <br />
                계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentsCheck(true)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleParentsCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingsCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleFourthDegreeCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 18: 사망 케이스 결과 */}
        {step === 18 && situation === 'deceased' && refundAmount === 'under300k' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 팩스, 우편, 방문, 유선</div>
                    <div className="text-xl ml-4 mt-1">(유선은 전산상 가족관계 확인 시)</div>
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 가족관계증명서(상세)</div>
                    <div>• 상속대표선정동의서(생략 가능)</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  전화로 신청하기
                </a>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleChildCaseSpouseCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 21: 형제자매 상황 */}
        {step === 21 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분(사망자)의 자녀분들은
                <br />
                어떤 상황인가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSiblingStatusSelect('only_child')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">자녀가 1명(외동)</div>
                <div className="text-3xl font-bold text-gray-900">뿐입니다</div>
              </button>

              <button
                onClick={() => handleSiblingStatusSelect('all_alive')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">자녀가 여러 명이며,</div>
                <div className="text-3xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleSiblingStatusSelect('some_deceased')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">자녀 중 진료받은 분보다</div>
                <div className="text-3xl font-bold text-gray-900">먼저 사망한 분이 있습니다</div>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleDaeseupCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 23: 자녀 케이스 결과 */}
        {step === 23 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'child' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    {!(hasSpouse === false && siblingStatus === 'only_child') && (
                      <div>• 상속대표선정동의서 (상속인 전원 서명)</div>
                    )}
                    <div>• 진료받은 분 기준 가족관계증명서(상세)</div>
                    {hasDaeseup && (
                      <div>• 사망한 형제(자매) 기준 가족관계증명서(상세)</div>
                    )}
                  </div>
                </div>

                {/* 상속인 안내 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 자녀</div>
                    {hasSpouse && <div>• 배우자</div>}
                    {hasDaeseup && (
                      <>
                        <div>• 사망한 자녀의 배우자(며느리)</div>
                        <div>• 사망한 자녀의 자녀 (손자녀)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseChildrenCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 25: 자녀 상황 (배우자 케이스) */}
        {step === 25 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                진료받은 분의 자녀분들
                <br />
                상황은 어떤가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleChildStatusSelect('one_child')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">자녀 1명(외동)</div>
                <div className="text-3xl font-bold text-gray-900">뿐입니다</div>
              </button>

              <button
                onClick={() => handleChildStatusSelect('multiple_alive')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">자녀가 여러 명이며</div>
                <div className="text-3xl font-bold text-gray-900">모두 생존</div>
              </button>

              <button
                onClick={() => handleChildStatusSelect('some_deceased')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">먼저 사망한</div>
                <div className="text-3xl font-bold text-gray-900">자녀가 있습니다</div>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseDaeseupCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSpouseCaseParentsCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 28: 배우자 케이스 결과 */}
        {step === 28 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'spouse' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    {hasChildren && (
                      <div>• 상속대표선정동의서 (상속인 전원 서명)</div>
                    )}
                    <div>• 진료받은 분 기준 가족관계증명서(상세)</div>
                    {hasDaeseup && (
                      <div>• 사망한 자녀 기준 가족관계증명서(상세)</div>
                    )}
                  </div>
                </div>

                {/* 상속인 안내 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 배우자</div>
                    {hasChildren && <div>• 자녀</div>}
                    {!hasChildren && hasParents && <div>• 부모</div>}
                    {hasDaeseup && (
                      <>
                        <div>• 사망한 자녀의 배우자(며느리)</div>
                        <div>• 사망한 자녀의 자녀 (손자녀)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandchildCaseParentCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleGrandparentSpouseCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">다른 자녀는 없습니다</div>
                <div className="text-2xl text-gray-600">(부모님이 외동)</div>
              </button>

              <button
                onClick={() => handleOtherChildrenStatusSelect('all_alive')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">다른 자녀들이</div>
                <div className="text-3xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleOtherChildrenStatusSelect('some_deceased')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">먼저 돌아가신</div>
                <div className="text-3xl font-bold text-gray-900">다른 자녀가 있습니다</div>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleOtherDaeseupCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 33: 손자녀 케이스 결과 */}
        {step === 33 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'grandchild' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 상속대표선정동의서 (상속인 전원 서명)</div>
                    <div>• 진료받은 분 기준 가족관계증명서(상세)</div>
                    <div>• 신청인 부모 기준 가족관계증명서(상세)</div>
                    {hasOtherDaeseup && (
                      <div>• 돌아가신 다른 자녀 기준 가족관계증명서(상세)</div>
                    )}
                  </div>
                </div>

                {/* 상속인 안내 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 손자녀 (신청인 - 대습상속)</div>
                    {otherChildrenStatus !== 'none' && <div>• 다른 자녀 (살아계신 분)</div>}
                    {hasGrandparentSpouse && <div>• 배우자 (할머니/할아버지)</div>}
                    {hasOtherDaeseup && (
                      <>
                        <div>• 돌아가신 다른 자녀의 배우자 (대습상속)</div>
                        <div>• 돌아가신 다른 자녀의 자녀 (대습상속)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingCaseSeniorHeirsCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
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
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">본인뿐입니다</div>
              </button>

              <button
                onClick={() => handleSiblingsStatusTypeSelect('multiple_alive')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">여러 명이고</div>
                <div className="text-3xl font-bold text-gray-900">모두 살아있습니다</div>
              </button>

              <button
                onClick={() => handleSiblingsStatusTypeSelect('some_deceased')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">여러 명이고</div>
                <div className="text-3xl font-bold text-gray-900">먼저 돌아가신 분이 있습니다</div>
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
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">예</span>
              </button>

              <button
                onClick={() => handleSiblingDaeseupCheck(false)}
                className="h-20 rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300"
              >
                <span className="text-3xl font-bold text-gray-900">아니오</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 38: 형제자매 케이스 결과 */}
        {step === 38 && situation === 'deceased' && refundAmount === 'over300k' && deceasedRelationship === 'sibling' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    {siblingsStatusType !== 'only_self' && (
                      <div>• 상속대표선정동의서 (상속인 전원 서명)</div>
                    )}
                    <div>• 진료받은 분 기준 가족관계증명서(상세)</div>
                    {hasSiblingDaeseup && (
                      <div>• 돌아가신 형제(자매) 기준 가족관계증명서(상세)</div>
                    )}
                  </div>
                </div>

                {/* 상속인 안내 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">누가 상속인인가요? (진료받은 분 기준)</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    {siblingsStatusType === 'only_self' && (
                      <div>• 형제자매 (신청인 단독)</div>
                    )}
                    {siblingsStatusType !== 'only_self' && (
                      <div>• 형제자매 (살아계신 분들)</div>
                    )}
                    {hasSiblingDaeseup && (
                      <>
                        <div>• 돌아가신 형제의 배우자 (대습상속)</div>
                        <div>• 돌아가신 형제의 자녀 (대습상속)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
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
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}

        {/* === 미성년자 케이스 === */}

        {/* STEP 42: 신청인 확인 (미성년자) */}
        {step === 42 && situation === 'alive' && aliveDetailType === 'minor' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                신청하시는 분은
                <br />
                미성년자와 어떤 관계신가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleMinorApplicantTypeSelect('parent')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">친권자 (부모)</div>
              </button>

              <button
                onClick={() => handleMinorApplicantTypeSelect('guardian')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">미성년후견인</div>
              </button>

              <button
                onClick={() => handleMinorApplicantTypeSelect('other')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">그 외</div>
                <div className="text-2xl text-gray-600">(친척, 조부모 등)</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 43: 부모 혼인 상태 (미성년자 - 친권자) */}
        {step === 43 && situation === 'alive' && aliveDetailType === 'minor' && minorApplicantType === 'parent' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                미성년자의 부모님은
                <br />
                현재 어떤 상태인가요?
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleParentMaritalStatusSelect('married')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">혼인 중</div>
                <div className="text-2xl text-gray-600">(이혼하지 않음)</div>
              </button>

              <button
                onClick={() => handleParentMaritalStatusSelect('divorced_or_separated')}
                className="rounded-2xl shadow-sm border transition-all active:scale-[0.98] bg-white border-gray-200 hover:border-emerald-300 p-5"
              >
                <div className="text-3xl font-bold text-gray-900">이혼/사별</div>
              </button>
            </div>
          </>
        )}

        {/* STEP 44: 미성년후견인 결과 */}
        {step === 44 && situation === 'alive' && aliveDetailType === 'minor' && minorApplicantType === 'guardian' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 미성년후견인 증명서류</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
              </div>
            </div>
          </>
        )}

        {/* STEP 45: 신청 불가 (미성년자 - 그 외) */}
        {step === 45 && situation === 'alive' && aliveDetailType === 'minor' && minorApplicantType === 'other' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div className="space-y-3">
                {/* 안내 메시지 */}
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <h2 className="text-3xl font-bold text-red-900 mb-4">신청 불가</h2>
                  <div className="text-2xl text-red-800 leading-relaxed">
                    미성년자의 환급금은
                    <br />
                    친권자(부모) 또는
                    <br />
                    미성년후견인만 신청 가능합니다.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 46: 공동친권 결과 (미성년자 - 혼인 중) */}
        {step === 46 && situation === 'alive' && aliveDetailType === 'minor' && minorApplicantType === 'parent' && parentMaritalStatus === 'married' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 팩스, 우편, 내방</div>
                    <div>• 유선</div>
                    <div className="text-xl text-gray-600 ml-4">
                      (※ 조건: 부, 모, 자녀 주민등록 주소 동일)
                    </div>
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-3">
                    <div>• 환급금 지급신청서</div>
                    <div>
                      <div>• 다음 중 하나:</div>
                      <div className="text-xl text-gray-700 ml-4 mt-2 space-y-1">
                        <div>① 미성년자 기준 기본증명서(상세)</div>
                        <div>② 부모 기준 가족관계증명서(상세)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  전화로 신청하기
                </a>
              </div>
            </div>
          </>
        )}

        {/* STEP 47: 단독친권 결과 (미성년자 - 이혼/사별) */}
        {step === 47 && situation === 'alive' && aliveDetailType === 'minor' && minorApplicantType === 'parent' && parentMaritalStatus === 'divorced_or_separated' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 미성년자 기준 기본증명서(상세)</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
              </div>
            </div>
          </>
        )}

        {/* STEP 48: 성년후견인 있음 결과 */}
        {step === 48 && situation === 'alive' && aliveDetailType === 'guardian_adult' && (
          <>
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              <div ref={captureRef} className="space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {/* 신청방법 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">신청방법</h2>
                  <div className="text-3xl text-gray-700">
                    • 팩스, 우편, 내방
                  </div>
                </div>

                {/* 제출서류 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">제출서류</h2>
                  <div className="text-3xl text-gray-700 space-y-2">
                    <div>• 환급금 지급신청서</div>
                    <div>• 후견 등기사항증명서</div>
                    <div>• 성년후견인 신분증 사본</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  저장하기
                </button>

                <Link
                  href="/fax"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  팩스 번호 찾기
                </Link>
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
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  가까운 지사 찾기
                </Link>

                <a
                  href="tel:1577-1000"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center"
                >
                  고객센터 전화 (1577-1000)
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
