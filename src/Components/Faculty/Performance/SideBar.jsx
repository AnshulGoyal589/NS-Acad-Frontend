import React from 'react';
import { ChevronDown, LayoutDashboard, BookOpen, Users, Award, Briefcase, BarChart3 } from 'lucide-react';

const SideBar = () => {
  return (
    <div className="w-[20%] h-screen fixed top-0 left-0 bg-gradient-to-b from-blue-100 to-white text-slate-100 flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-200">
        <div className="flex items-center space-x-3">
          <img src="../../file.png" alt="logo" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-wide">Faculty Portal</span>
            <span className="text-xs text-blue-100">Performance Management</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-1">

          {/* Self Appraisal Section */}
          <details className="group" open>
            <summary className="flex items-center gap-3 p-3 font-medium cursor-pointer hover:bg-blue-100 rounded-lg transition-all duration-200 outline-none">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Self Appraisal</span>
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180 text-blue-500" />
            </summary>
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-4">
              <div id='c4e293e9-1f5c-4edd-a3e5-fa0dfc23e566' onClick={ () => window.location.href = `/c4e293e9-1f5c-4edd-a3e5-fa0dfc23e566` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Teacher Training through SWAYAM portal
              </div>
              <div id='2544a712-bd7d-46ee-8ca8-12c51f8bed35' onClick={ () => window.location.href = `/2544a712-bd7d-46ee-8ca8-12c51f8bed35` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Details of FDPs
              </div>
              <div id='71bcb869-24e1-4729-af2f-1dc0bdb37160' onClick={ () => window.location.href = `/71bcb869-24e1-4729-af2f-1dc0bdb37160` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                MOOCS course completed with E-Certification
              </div>
              <div id='4d6f5dca-b6e6-46dc-aa2b-f3cfd7cfa99c' onClick={ () => window.location.href = `/4d6f5dca-b6e6-46dc-aa2b-f3cfd7cfa99c` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Industrial Training undertaken
              </div>
              <div id='d2d32dbb-a6cc-458e-8110-61f192f06163' onClick={ () => window.location.href = `/d2d32dbb-a6cc-458e-8110-61f192f06163` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Research publications
              </div>
              <div id='100f2f8f-e4e1-4baa-a991-c8e488a12bfb' onClick={ () => window.location.href = `/100f2f8f-e4e1-4baa-a991-c8e488a12bfb` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                PhD students guided
              </div>
              <div id='e335269e-e824-41c7-a7f8-dfe32ad563f0' onClick={ () => window.location.href = `/e335269e-e824-41c7-a7f8-dfe32ad563f0` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Patent published/granted
              </div>
              <div id='2a15c929-294c-4e8c-a145-5f5a207c3acf' onClick={ () => window.location.href = `/2a15c929-294c-4e8c-a145-5f5a207c3acf` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Details of Research Projects
              </div>
              <div id='593cc266-6e28-4db4-a865-989aa89347e1' onClick={ () => window.location.href = `/593cc266-6e28-4db4-a865-989aa89347e1` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Details of MOOCs/e-content developed
              </div>
            </div>
          </details>

          {/* 360° Feedback Section */}
          <details className="group">
            <summary className="flex items-center gap-3 p-3 font-medium cursor-pointer hover:bg-blue-100 rounded-lg transition-all duration-200 outline-none">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">360° Feedback</span>
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180 text-blue-500" />
            </summary>
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-4">
              <div id='ea758c6c-89aa-4223-9e3c-f053674bdaa7' onClick={ () => window.location.href = `/ea758c6c-89aa-4223-9e3c-f053674bdaa7` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Teaching Process
              </div>
              <div id='ef8b0c79-3799-4ba0-b5af-7f23516572c1' onClick={ () => window.location.href = `/ef8b0c79-3799-4ba0-b5af-7f23516572c1` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Students' Feedback
              </div>
              <div id='e2cd5bc7-a86a-41d1-8417-0322cec89540' onClick={ () => window.location.href = `/e2cd5bc7-a86a-41d1-8417-0322cec89540` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Departmental Activities
              </div>
              <div id='6ee8ce30-1266-4412-8e43-4721aa4ce401' onClick={ () => window.location.href = `/6ee8ce30-1266-4412-8e43-4721aa4ce401` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                University/Campus Activities
              </div>
              <div id='36d33aa9-baab-41cd-87c3-43c16f57789b' onClick={ () => window.location.href = `/36d33aa9-baab-41cd-87c3-43c16f57789b` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                ACR maintained at institute level
              </div>
              <div id='36d33aa9-baab-41cd-87c3-43c16f59989b' onClick={ () => window.location.href = `/36d33aa9-baab-41cd-87c3-43c16f59989b` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Contribution to Society
              </div>
            </div>
          </details>

          {/* Category 3 Section */}
          <details className="group">
            <summary className="flex items-center gap-3 p-3 font-medium cursor-pointer hover:bg-blue-100 rounded-lg transition-all duration-200 outline-none">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Category 3</span>
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180 text-blue-500" />
            </summary>
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-4">
              <div id='c70afe60-c3cc-4ade-9369-137ffee0221d' onClick={ () => window.location.href = `/c70afe60-c3cc-4ade-9369-137ffee0221d` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Books
              </div>
              <div id='41b0275c-1217-4dd6-a897-d1dad2ec19b1' onClick={ () => window.location.href = `/41b0275c-1217-4dd6-a897-d1dad2ec19b1` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Book Chapter
              </div>
              <div id='58ee31b4-bcd0-4152-84ee-d20541655d4c' onClick={ () => window.location.href = `/58ee31b4-bcd0-4152-84ee-d20541655d4c` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Journals
              </div>
              <div id='d4a4b731-0366-42cf-91d8-af45ce1e5c79' onClick={ () => window.location.href = `/d4a4b731-0366-42cf-91d8-af45ce1e5c79` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Conferences
              </div>
              <div id='5c97fdc9-12a4-4551-af1c-b9962e962be3' onClick={ () => window.location.href = `/5c97fdc9-12a4-4551-af1c-b9962e962be3` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Mtech Project
              </div>
              <div id='5f7b6f6d-fc1a-4086-85ff-adc1c3a4ffd7' onClick={ () => window.location.href = `/5f7b6f6d-fc1a-4086-85ff-adc1c3a4ffd7` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Btech Project
              </div>
              <div id='08f9f04e-eb8e-4a10-9779-e2c93f10c8bd' onClick={ () => window.location.href = `/08f9f04e-eb8e-4a10-9779-e2c93f10c8bd` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                PHD scholars
              </div>
              <div id='0f881caa-141c-457a-9489-48a22edfedda' onClick={ () => window.location.href = `/0f881caa-141c-457a-9489-48a22edfedda` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Faculty development Programs
              </div>
            </div>
          </details>

          {/* Category 4 Section */}
          <details className="group">
            <summary className="flex items-center gap-3 p-3 font-medium cursor-pointer hover:bg-blue-100 rounded-lg transition-all duration-200 outline-none">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Category 4</span>
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180 text-blue-500" />
            </summary>
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-4">
              <div id='bb086f1f-cf83-4c01-a0e5-094e0c82b8e3' onClick={ () => window.location.href = `/bb086f1f-cf83-4c01-a0e5-094e0c82b8e3` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Short term courses
              </div>
              <div id='88b02c4d-8cea-4344-b1de-d57b05d823b4' onClick={ () => window.location.href = `/88b02c4d-8cea-4344-b1de-d57b05d823b4` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Project Grant
              </div>
              <div id='43e0a50c-6907-4e0a-9306-961b1fbefde4' onClick={ () => window.location.href = `/43e0a50c-6907-4e0a-9306-961b1fbefde4` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Consultancy Projects
              </div>
              <div id='7a34b790-37a7-4f0e-a8e6-057d000c3529' onClick={ () => window.location.href = `/7a34b790-37a7-4f0e-a8e6-057d000c3529` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Patent
              </div>
              <div id='c80c883d-60e5-4715-bce4-5a875dc42f27' onClick={ () => window.location.href = `/c80c883d-60e5-4715-bce4-5a875dc42f27` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Invited Talk
              </div>
              <div id='757a442d-0c95-41f4-ab3b-1fb80676ec49' onClick={ () => window.location.href = `/757a442d-0c95-41f4-ab3b-1fb80676ec49` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Society Membership
              </div>
              <div id='ec5c1827-0dd3-498b-be5c-8d12b53b75cd' onClick={ () => window.location.href = `/ec5c1827-0dd3-498b-be5c-8d12b53b75cd` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Teaching Duty
              </div>
              <div id='b6b8e826-68e1-4a34-8744-3f729db9204e' onClick={ () => window.location.href = `/b6b8e826-68e1-4a34-8744-3f729db9204e` } className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Material Consulted
              </div>
            </div>
          </details>

          {/* COPO Analysis Section */}
          <details className="group">
            <summary className="flex items-center gap-3 p-3 font-medium cursor-pointer hover:bg-blue-100 rounded-lg transition-all duration-200 outline-none">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">COPO Analysis</span>
              <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180 text-blue-500" />
            </summary>
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-4">
              <div onClick={() => window.location.href = `/copo`} className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Assessment Form
              </div>
              <div onClick={() => window.location.href = `/copo/dashboard`} className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                Attainment Dashboard
              </div>
            </div>
          </details>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-blue-100">Faculty Portal</span>
            <span className="text-sm font-medium">v2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;