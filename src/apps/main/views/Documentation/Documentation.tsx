// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC } from "react";
import { Box, GridItem } from "@chakra-ui/react";



export const Documentation: FC = () => {
    return (
        <>
            <object
                data="https://files.specki.xyz/hdZCjTNh/PEOPLE-ECCO%20-%20D4.1%20-%20Technical%20Specifications%20V0.2.docx.pdf"
                type="application/pdf"
                width="100%"
                height="800"
                aria-label="docs"
            />
            {/* <GridItem colSpan={12} rowSpan={8} borderWidth="1px" margin="1%" padding="1%">
                <Box borderWidth="1px">
                    <div id="header">
                        <h1><span className="image"><img src="./images/arc42-logo.png" alt="arc42" /></span> Template</h1>
                        <div className="details">
                            <span id="revnumber">version 8.2 EN,</span>
                            <span id="revdate">January 2023</span>
                            <br /><span id="revremark">(based upon AsciiDoc version)</span>
                        </div>
                        <div id="toc" className="toc">
                            <div id="toctitle">Table of Contents</div>
                            <ul className="sectlevel1">
                                <li><a href="#section-introduction-and-goals">1. Introduction and Goals</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_requirements_overview">1.1. Requirements Overview</a></li>
                                        <li><a href="#_quality_goals">1.2. Quality Goals</a></li>
                                        <li><a href="#_stakeholders">1.3. Stakeholders</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-architecture-constraints">2. Architecture Constraints</a></li>
                                <li><a href="#section-context-and-scope">3. Context and Scope</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_business_context">3.1. Business Context</a></li>
                                        <li><a href="#_technical_context">3.2. Technical Context</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-solution-strategy">4. Solution Strategy</a></li>
                                <li><a href="#section-building-block-view">5. Building Block View</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_whitebox_overall_system">5.1. Whitebox Overall System</a></li>
                                        <li><a href="#_level_2">5.2. Level 2</a></li>
                                        <li><a href="#_level_3">5.3. Level 3</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-runtime-view">6. Runtime View</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_runtime_scenario_1">6.1. &lt;Runtime Scenario 1&gt;</a></li>
                                        <li><a href="#_runtime_scenario_2">6.2. &lt;Runtime Scenario 2&gt;</a></li>
                                        <li><a href="#">6.3. &#8230;&#8203;</a></li>
                                        <li><a href="#_runtime_scenario_n">6.4. &lt;Runtime Scenario n&gt;</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-deployment-view">7. Deployment View</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_infrastructure_level_1">7.1. Infrastructure Level 1</a></li>
                                        <li><a href="#_infrastructure_level_2">7.2. Infrastructure Level 2</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-concepts">8. Cross-cutting Concepts</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_concept_1">8.1. <em>&lt;Concept 1&gt;</em></a></li>
                                        <li><a href="#_concept_2">8.2. <em>&lt;Concept 2&gt;</em></a></li>
                                        <li><a href="#_concept_n">8.3. <em>&lt;Concept n&gt;</em></a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-design-decisions">9. Architecture Decisions</a></li>
                                <li><a href="#section-quality-scenarios">10. Quality Requirements</a>
                                    <ul className="sectlevel2">
                                        <li><a href="#_quality_tree">10.1. Quality Tree</a></li>
                                        <li><a href="#_quality_scenarios">10.2. Quality Scenarios</a></li>
                                    </ul>
                                </li>
                                <li><a href="#section-technical-risks">11. Risks and Technical Debts</a></li>
                                <li><a href="#section-glossary">12. Glossary</a></li>
                            </ul>
                        </div>
                    </div>
                    <div id="content">
                        <div id="preamble">
                            <div className="sectionbody">
                                <div className="paragraph">
                                    <p><strong>About arc42</strong></p>
                                </div>
                                <div className="paragraph lead">
                                    <p>arc42, the template for documentation of software and system architecture.</p>
                                </div>
                                <div className="paragraph">
                                    <p>Template Version 8.2 EN. (based upon AsciiDoc version), January 2023</p>
                                </div>
                                <div className="paragraph">
                                    <p>Created, maintained and &#169; by Dr. Peter Hruschka, Dr. Gernot Starke and contributors.
                                        See <a href="https://arc42.org" className="bare">https://arc42.org</a>.</p>
                                </div>
                                <hr />
                                <div style={{ pageBreakAfter: "always" }}></div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-introduction-and-goals">1. Introduction and Goals</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_requirements_overview">1.1. Requirements Overview</h3>

                                </div>
                                <div className="sect2">
                                    <h3 id="_quality_goals">1.2. Quality Goals</h3>

                                </div>
                                <div className="sect2">
                                    <h3 id="_stakeholders">1.3. Stakeholders</h3>
                                    <table className="tableblock frame-all grid-all stretch">
                                        <colgroup>
                                            <col style={{ width: "20%" }} />
                                            <col style={{ width: "40%" }} />
                                            <col style={{ width: "40%" }} />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th className="tableblock halign-left valign-top">Role/Name</th>
                                                <th className="tableblock halign-left valign-top">Contact</th>
                                                <th className="tableblock halign-left valign-top">Expectations</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Role-1&gt;</em></p></td>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Contact-1&gt;</em></p></td>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Expectation-1&gt;</em></p></td>
                                            </tr>
                                            <tr>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Role-2&gt;</em></p></td>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Contact-2&gt;</em></p></td>
                                                <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Expectation-2&gt;</em></p></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div style={{ pageBreakAfter: "always" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-architecture-constraints">2. Architecture Constraints</h2>
                            <div className="sectionbody">
                                <div style={{ pageBreakAfter: "always" }}></div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-context-and-scope">3. Context and Scope</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_business_context">3.1. Business Context</h3>
                                    <div className="paragraph">
                                        <p><strong>&lt;Diagram or Table&gt;</strong></p>
                                    </div>
                                    <div className="paragraph">
                                        <p><strong>&lt;optionally: Explanation of external domain interfaces&gt;</strong></p>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_technical_context">3.2. Technical Context</h3>
                                    <div className="paragraph">
                                        <p><strong>&lt;Diagram or Table&gt;</strong></p>
                                    </div>
                                    <div className="paragraph">
                                        <p><strong>&lt;optionally: Explanation of technical interfaces&gt;</strong></p>
                                    </div>
                                    <div className="paragraph">
                                        <p><strong>&lt;Mapping Input/Output to Channels&gt;</strong></p>
                                    </div>
                                    <div style={{ pageBreakAfter: "always" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-solution-strategy">4. Solution Strategy</h2>
                            <div className="sectionbody">
                                <div style={{ pageBreakAfter: "always" }}></div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-building-block-view">5. Building Block View</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_whitebox_overall_system">5.1. Whitebox Overall System</h3>
                                    <div className="paragraph">
                                        <p><em><strong>&lt;Overview Diagram&gt;</strong></em></p>
                                    </div>
                                    <div className="dlist">
                                        <dl>
                                            <dt className="hdlist1">Motivation</dt>
                                            <dd>
                                                <p><em>&lt;text explanation&gt;</em></p>
                                            </dd>
                                            <dt className="hdlist1">Contained Building Blocks</dt>
                                            <dd>
                                                <p><em>&lt;Description of contained building block (black boxes)&gt;</em></p>
                                            </dd>
                                            <dt className="hdlist1">Important Interfaces</dt>
                                            <dd>
                                                <p><em>&lt;Description of important interfaces&gt;</em></p>
                                            </dd>
                                        </dl>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_name_black_box_1">5.1.1. &lt;Name black box 1&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;Purpose/Responsibility&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p><em>&lt;Interface(s)&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p><em>&lt;(Optional) Quality/Performance Characteristics&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p><em>&lt;(Optional) Directory/File Location&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p><em>&lt;(Optional) Fulfilled Requirements&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p><em>&lt;(optional) Open Issues/Problems/Risks&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_name_black_box_2">5.1.2. &lt;Name black box 2&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;black box template&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_name_black_box_n">5.1.3. &lt;Name black box n&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;black box template&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_name_interface_1">5.1.4. &lt;Name interface 1&gt;</h4>
                                        <div className="paragraph">
                                            <p>&#8230;&#8203;</p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_name_interface_m">5.1.5. &lt;Name interface m&gt;</h4>

                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_level_2">5.2. Level 2</h3>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_1">5.2.1. White Box <em>&lt;building block 1&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_2">5.2.2. White Box <em>&lt;building block 2&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p>&#8230;&#8203;</p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_m">5.2.3. White Box <em>&lt;building block m&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_level_3">5.3. Level 3</h3>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_x_1">5.3.1. White Box &lt;_building block x.1_&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_x_2">5.3.2. White Box &lt;_building block x.2_&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_white_box_building_block_y_1">5.3.3. White Box &lt;_building block y.1_&gt;</h4>
                                        <div className="paragraph">
                                            <p><em>&lt;white box template&gt;</em></p>
                                        </div>
                                        <div style={{ pageBreakAfter: "always" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-runtime-view">6. Runtime View</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_runtime_scenario_1">6.1. &lt;Runtime Scenario 1&gt;</h3>
                                    <div className="ulist">
                                        <ul>
                                            <li>
                                                <p><em>&lt;insert runtime diagram or textual description of the scenario&gt;</em></p>
                                            </li>
                                            <li>
                                                <p><em>&lt;insert description of the notable aspects of the interactions between the
                                                    building block instances depicted in this diagram.&gt;</em></p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_runtime_scenario_2">6.2. &lt;Runtime Scenario 2&gt;</h3>

                                </div>
                                <div className="sect2">
                                    <h3 id="">6.3. &#8230;&#8203;</h3>

                                </div>
                                <div className="sect2">
                                    <h3 id="_runtime_scenario_n">6.4. &lt;Runtime Scenario n&gt;</h3>
                                    <div style={{ pageBreakAfter: "always" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-deployment-view">7. Deployment View</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_infrastructure_level_1">7.1. Infrastructure Level 1</h3>
                                    <div className="paragraph">
                                        <p><em><strong>&lt;Overview Diagram&gt;</strong></em></p>
                                    </div>
                                    <div className="dlist">
                                        <dl>
                                            <dt className="hdlist1">Motivation</dt>
                                            <dd>
                                                <p><em>&lt;explanation in text form&gt;</em></p>
                                            </dd>
                                            <dt className="hdlist1">Quality and/or Performance Features</dt>
                                            <dd>
                                                <p><em>&lt;explanation in text form&gt;</em></p>
                                            </dd>
                                            <dt className="hdlist1">Mapping of Building Blocks to Infrastructure</dt>
                                            <dd>
                                                <p><em>&lt;description of the mapping&gt;</em></p>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_infrastructure_level_2">7.2. Infrastructure Level 2</h3>
                                    <div className="sect3">
                                        <h4 id="_infrastructure_element_1">7.2.1. <em>&lt;Infrastructure Element 1&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;diagram + explanation&gt;</em></p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_infrastructure_element_2">7.2.2. <em>&lt;Infrastructure Element 2&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;diagram + explanation&gt;</em></p>
                                        </div>
                                        <div className="paragraph">
                                            <p>&#8230;&#8203;</p>
                                        </div>
                                    </div>
                                    <div className="sect3">
                                        <h4 id="_infrastructure_element_n">7.2.3. <em>&lt;Infrastructure Element n&gt;</em></h4>
                                        <div className="paragraph">
                                            <p><em>&lt;diagram + explanation&gt;</em></p>
                                        </div>
                                        <div style={{ pageBreakAfter: "always" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-concepts">8. Cross-cutting Concepts</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_concept_1">8.1. <em>&lt;Concept 1&gt;</em></h3>
                                    <div className="paragraph">
                                        <p><em>&lt;explanation&gt;</em></p>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_concept_2">8.2. <em>&lt;Concept 2&gt;</em></h3>
                                    <div className="paragraph">
                                        <p><em>&lt;explanation&gt;</em></p>
                                    </div>
                                    <div className="paragraph">
                                        <p>&#8230;&#8203;</p>
                                    </div>
                                </div>
                                <div className="sect2">
                                    <h3 id="_concept_n">8.3. <em>&lt;Concept n&gt;</em></h3>
                                    <div className="paragraph">
                                        <p><em>&lt;explanation&gt;</em></p>
                                    </div>
                                    <div style={{ pageBreakAfter: "always" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-design-decisions">9. Architecture Decisions</h2>
                            <div className="sectionbody">
                                <div style={{ pageBreakAfter: "always" }}></div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-quality-scenarios">10. Quality Requirements</h2>
                            <div className="sectionbody">
                                <div className="sect2">
                                    <h3 id="_quality_tree">10.1. Quality Tree</h3>

                                </div>
                                <div className="sect2">
                                    <h3 id="_quality_scenarios">10.2. Quality Scenarios</h3>
                                    <div style={{ pageBreakAfter: "always" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-technical-risks">11. Risks and Technical Debts</h2>
                            <div className="sectionbody">
                                <div style={{ pageBreakAfter: "always" }}></div>
                            </div>
                        </div>
                        <div className="sect1">
                            <h2 id="section-glossary">12. Glossary</h2>
                            <div className="sectionbody">
                                <table className="tableblock frame-all grid-all stretch">
                                    <thead>
                                        <tr>
                                            <th className="tableblock halign-left valign-top">Term</th>
                                            <th className="tableblock halign-left valign-top">Definition</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Term-1&gt;</em></p></td>
                                            <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;definition-1&gt;</em></p></td>
                                        </tr>
                                        <tr>
                                            <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;Term-2&gt;</em></p></td>
                                            <td className="tableblock halign-left valign-top"><p className="tableblock"><em>&lt;definition-2&gt;</em></p></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div id="footer">
                        <div id="footer-text">
                            Version 8.2 EN<br />
                            Last updated 2024-11-04 17:00:46 +0100
                        </div>
                    </div>
                </Box>
            </GridItem> */}
        </>
    );
};